const mongoose = require("mongoose");

const decimalToNumber = (value) => {
	if (value === null || value === undefined) {
		return null;
	}

	if (typeof value === "number") {
		return value;
	}

	if (typeof value === "string") {
		const parsed = Number(value);
		return Number.isNaN(parsed) ? null : parsed;
	}

	if (value && typeof value.toString === "function") {
		const parsed = Number(value.toString());
		return Number.isNaN(parsed) ? null : parsed;
	}

	return null;
};

const listingSchema = new mongoose.Schema(
	{
		_id: {
			type: String,
			required: true,
			trim: true,
		},
		listing_url: {
			type: String,
			trim: true,
			default: null,
		},
		name: {
			type: String,
			required: true,
			trim: true,
			index: true,
		},
		summary: {
			type: String,
			trim: true,
			default: "",
		},
		space: {
			type: String,
			trim: true,
			default: "",
		},
		description: {
			type: String,
			required: true,
			trim: true,
		},
		neighborhood_overview: {
			type: String,
			trim: true,
			default: "",
		},
		notes: {
			type: String,
			trim: true,
			default: "",
		},
		transit: {
			type: String,
			trim: true,
			default: "",
		},
		access: {
			type: String,
			trim: true,
			default: "",
		},
		interaction: {
			type: String,
			trim: true,
			default: "",
		},
		house_rules: {
			type: String,
			trim: true,
			default: "",
		},
		property_type: {
			type: String,
			required: true,
			trim: true,
			index: true,
		},
		room_type: {
			type: String,
			trim: true,
			default: null,
		},
		bed_type: {
			type: String,
			trim: true,
			default: null,
		},
		minimum_nights: {
			type: Number,
			min: 1,
			default: 1,
		},
		maximum_nights: {
			type: Number,
			min: 1,
			default: 1125,
		},
		accommodates: {
			type: Number,
			min: 1,
			default: 1,
		},
		bedrooms: {
			type: Number,
			min: 0,
			default: 0,
		},
		beds: {
			type: Number,
			min: 0,
			default: 0,
		},
		bathrooms: {
			type: mongoose.Schema.Types.Decimal128,
			default: null,
		},
		amenities: {
			type: [String],
			default: [],
		},
		price: {
			type: mongoose.Schema.Types.Decimal128,
			required: true,
		},
		weekly_price: {
			type: mongoose.Schema.Types.Decimal128,
			default: null,
		},
		monthly_price: {
			type: mongoose.Schema.Types.Decimal128,
			default: null,
		},
		cleaning_fee: {
			type: mongoose.Schema.Types.Decimal128,
			default: null,
		},
		extra_people: {
			type: mongoose.Schema.Types.Decimal128,
			default: null,
		},
		guests_included: {
			type: mongoose.Schema.Types.Decimal128,
			default: null,
		},
		images: {
			thumbnail_url: { type: String, trim: true, default: "" },
			medium_url: { type: String, trim: true, default: "" },
			picture_url: { type: String, trim: true, default: "" },
			xl_picture_url: { type: String, trim: true, default: "" },
		},
		host: {
			host_id: { type: String, required: true, trim: true, index: true },
		},
		address: {
			street: { type: String, trim: true, default: "" },
			suburb: { type: String, trim: true, default: "" },
			government_area: { type: String, trim: true, default: "" },
			market: { type: String, trim: true, default: "", index: true },
			country: { type: String, trim: true, default: "" },
			country_code: { type: String, trim: true, default: "" },
			location: {
				type: {
					type: String,
					enum: ["Point"],
					default: "Point",
				},
				coordinates: {
					type: [Number],
					default: undefined,
					validate: {
						validator: (coords) => !coords || coords.length === 2,
						message: "Location coordinates must be [longitude, latitude].",
					},
				},
				is_location_exact: {
					type: Boolean,
					default: false,
				},
			},
		},
		city: {
			type: String,
			trim: true,
			index: true,
			default: "",
		},
		pricePerNight: {
			type: Number,
			min: 0,
			index: true,
			default: 0,
		},
		capacity: {
			type: Number,
			min: 1,
			default: 1,
		},
	},
	{ timestamps: true }
);

listingSchema.pre("validate", function (next) {
	this.city = this.city || this.address?.market || this.address?.suburb || "";
	this.pricePerNight = decimalToNumber(this.price) ?? this.pricePerNight ?? 0;
	this.capacity = this.capacity || this.accommodates || 1;
	next();
});

listingSchema.index({ city: 1, property_type: 1, pricePerNight: 1 });
listingSchema.index({ "address.location": "2dsphere" });
listingSchema.index({ name: "text", summary: "text", description: "text", "address.market": "text" });

listingSchema.virtual("photos").get(function () {
	return [this.images?.picture_url, this.images?.thumbnail_url, this.images?.medium_url, this.images?.xl_picture_url].filter(Boolean);
});

listingSchema.virtual("reviews", {
	ref: "Review",
	localField: "_id",
	foreignField: "listingId",
});

listingSchema.set("toJSON", { virtuals: true });
listingSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Listing", listingSchema);
