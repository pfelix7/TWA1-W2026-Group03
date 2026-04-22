const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");

const envPath = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: envPath });

const connectDB = require("../config/db");
const User = require("../models/User");
const Listing = require("../models/Listing");
const Review = require("../models/Review");

function parseArgs(argv) {
  const args = {
    file: path.resolve(__dirname, "../data/airbnb.listingAndReviews.json"),
    reset: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === "--file" && argv[i + 1]) {
      args.file = path.resolve(process.cwd(), argv[i + 1]);
      i += 1;
      continue;
    }

    if (token === "--reset") {
      args.reset = true;
    }
  }

  return args;
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (typeof value === "object" && value.$numberDecimal !== undefined) {
    const parsed = Number(value.$numberDecimal);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toDecimalInput(value) {
  const number = toNumber(value);
  return number === null ? null : String(number);
}

function parseReviewDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function makeSyntheticEmail(prefix, externalId) {
  return `${prefix}_${externalId}@seed.local`;
}

function splitName(fullName) {
  if (!fullName || typeof fullName !== "string") {
    return { firstName: "Guest", lastName: "User" };
  }

  const clean = fullName.trim().replace(/\s+/g, " ");
  if (!clean) {
    return { firstName: "Guest", lastName: "User" };
  }

  const parts = clean.split(" ");
  const firstName = parts.shift() || "Guest";
  const lastName = parts.join(" ") || "User";
  return { firstName, lastName };
}

function normalizeListing(raw) {
  return {
    _id: String(raw._id),
    listing_url: raw.listing_url || null,
    name: raw.name || "Untitled listing",
    summary: raw.summary || "",
    space: raw.space || "",
    description: raw.description || raw.summary || "No description",
    neighborhood_overview: raw.neighborhood_overview || "",
    notes: raw.notes || "",
    transit: raw.transit || "",
    access: raw.access || "",
    interaction: raw.interaction || "",
    house_rules: raw.house_rules || "",
    property_type: raw.property_type || "Other",
    room_type: raw.room_type || null,
    bed_type: raw.bed_type || null,
    minimum_nights: toNumber(raw.minimum_nights) || 1,
    maximum_nights: toNumber(raw.maximum_nights) || 1125,
    accommodates: toNumber(raw.accommodates) || 1,
    bedrooms: toNumber(raw.bedrooms) || 0,
    beds: toNumber(raw.beds) || 0,
    bathrooms: toDecimalInput(raw.bathrooms),
    amenities: Array.isArray(raw.amenities) ? raw.amenities : [],
    price: toDecimalInput(raw.price) || "0",
    weekly_price: toDecimalInput(raw.weekly_price),
    monthly_price: toDecimalInput(raw.monthly_price),
    cleaning_fee: toDecimalInput(raw.cleaning_fee),
    extra_people: toDecimalInput(raw.extra_people),
    guests_included: toDecimalInput(raw.guests_included),
    images: {
      thumbnail_url: raw.images?.thumbnail_url || "",
      medium_url: raw.images?.medium_url || "",
      picture_url: raw.images?.picture_url || "",
      xl_picture_url: raw.images?.xl_picture_url || "",
    },
    host: {
      host_id: String(raw.host?.host_id || "unknown-host"),
    },
    address: {
      street: raw.address?.street || "",
      suburb: raw.address?.suburb || "",
      government_area: raw.address?.government_area || "",
      market: raw.address?.market || "",
      country: raw.address?.country || "",
      country_code: raw.address?.country_code || "",
      location: {
        type: "Point",
        coordinates: Array.isArray(raw.address?.location?.coordinates)
          ? raw.address.location.coordinates
          : undefined,
        is_location_exact: Boolean(raw.address?.location?.is_location_exact),
      },
    },
  };
}

function reviewExternalId(listingId, rawReview, reviewIndex) {
  if (rawReview._id) {
    return String(rawReview._id);
  }

  const hashInput = JSON.stringify({
    listingId,
    reviewerId: rawReview.reviewer_id,
    reviewerName: rawReview.reviewer_name,
    date: rawReview.date,
    comments: rawReview.comments,
    reviewIndex,
  });

  return crypto.createHash("sha1").update(hashInput).digest("hex");
}

async function upsertUsersByExternalId(userRecords) {
  if (!userRecords.length) {
    return;
  }

  const ops = userRecords.map((entry) => ({
    updateOne: {
      filter: { externalUserId: entry.externalUserId },
      update: {
        $setOnInsert: {
          firstName: entry.firstName,
          lastName: entry.lastName,
          email: entry.email,
          passwordHash: "seeded_external_account",
          role: "student",
          externalUserId: entry.externalUserId,
        },
      },
      upsert: true,
    },
  }));

  await User.bulkWrite(ops, { ordered: false });
}

async function buildUserMap(externalIds) {
  if (!externalIds.length) {
    return new Map();
  }

  const users = await User.find(
    { externalUserId: { $in: externalIds } },
    { _id: 1, externalUserId: 1 }
  ).lean();

  return new Map(users.map((u) => [u.externalUserId, u._id]));
}

async function importDataset({ file, reset }) {
  const rawText = fs.readFileSync(file, "utf8");
  const sourceData = JSON.parse(rawText);

  if (!Array.isArray(sourceData)) {
    throw new Error("Dataset root must be a JSON array.");
  }

  if (reset) {
    await Listing.deleteMany({});
    await Review.deleteMany({ source: "dataset" });
    await User.deleteMany({ email: /@seed\.local$/i });
  }

  const hostIds = new Set();
  const reviewerSeedEntries = [];

  for (const listing of sourceData) {
    if (listing?.host?.host_id) {
      hostIds.add(String(listing.host.host_id));
    }

    if (Array.isArray(listing?.reviews)) {
      for (const review of listing.reviews) {
        if (!review?.reviewer_id) {
          continue;
        }

        const reviewerId = String(review.reviewer_id);
        const parts = splitName(review.reviewer_name || "Guest User");
        reviewerSeedEntries.push({
          externalUserId: reviewerId,
          firstName: parts.firstName,
          lastName: parts.lastName,
          email: makeSyntheticEmail("reviewer", reviewerId),
        });
      }
    }
  }

  const hostSeedEntries = [...hostIds].map((hostId) => ({
    externalUserId: hostId,
    firstName: "Host",
    lastName: hostId,
    email: makeSyntheticEmail("host", hostId),
  }));

  const allUserEntriesMap = new Map();
  for (const userEntry of [...hostSeedEntries, ...reviewerSeedEntries]) {
    if (!allUserEntriesMap.has(userEntry.externalUserId)) {
      allUserEntriesMap.set(userEntry.externalUserId, userEntry);
    }
  }

  await upsertUsersByExternalId([...allUserEntriesMap.values()]);

  const listingOps = sourceData.map((raw) => {
    const listingDoc = normalizeListing(raw);

    return {
      updateOne: {
        filter: { _id: listingDoc._id },
        update: { $set: listingDoc },
        upsert: true,
      },
    };
  });

  if (listingOps.length) {
    await Listing.bulkWrite(listingOps, { ordered: false });
  }

  const userIdMap = await buildUserMap([...allUserEntriesMap.keys()]);

  const reviewOps = [];
  for (const listing of sourceData) {
    if (!Array.isArray(listing?.reviews)) {
      continue;
    }

    const listingId = String(listing._id);

    for (let i = 0; i < listing.reviews.length; i += 1) {
      const rawReview = listing.reviews[i];
      const comment = (rawReview.comments || rawReview.comment || "").trim();
      if (!comment) {
        continue;
      }

      const reviewerId = rawReview.reviewer_id ? String(rawReview.reviewer_id) : null;
      const extReviewId = reviewExternalId(listingId, rawReview, i);

      reviewOps.push({
        updateOne: {
          filter: { externalReviewId: extReviewId },
          update: {
            $set: {
              source: "dataset",
              externalReviewId: extReviewId,
              listingId,
              reviewerId,
              reviewerName: rawReview.reviewer_name || null,
              user: reviewerId ? userIdMap.get(reviewerId) || null : null,
              comment,
              reviewDate: parseReviewDate(rawReview.date),
              rating: null,
              photoUrl: null,
            },
          },
          upsert: true,
        },
      });
    }
  }

  if (reviewOps.length) {
    await Review.bulkWrite(reviewOps, { ordered: false });
  }

  return {
    listings: sourceData.length,
    users: allUserEntriesMap.size,
    reviews: reviewOps.length,
  };
}

async function main() {
  const args = parseArgs(process.argv);

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing. Add it to server/.env before importing.");
  }

  if (!fs.existsSync(args.file)) {
    throw new Error(`Dataset file not found: ${args.file}`);
  }

  await connectDB();

  try {
    const result = await importDataset(args);
    console.log("Import complete:");
    console.log(`- Listings upserted: ${result.listings}`);
    console.log(`- Seed users upserted: ${result.users}`);
    console.log(`- Reviews upserted: ${result.reviews}`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("Import failed:", error.message);
  process.exit(1);
});
