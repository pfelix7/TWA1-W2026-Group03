require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRouter = require("./routes/auth");
const listingsRouter = require("./routes/listings");
const reviewsRouter = require("./routes/reviews");
const profileRouter = require("./routes/profile");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

async function startServer() {
    await connectDB();

    app.use("/api/auth", authRouter);
    app.use("/api/listings", listingsRouter);
    app.use("/api/reviews", reviewsRouter);
    app.use("/api/profile", profileRouter);
    
    app.use((req, res) => {
        res.status(404).json({ error: "Route not found"});
    });

    app.use((err, req, res) => {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    });

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();