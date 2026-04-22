require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRouter = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

async function startServer() {
    await connectDB();

    app.use("/api/auth", authRouter);

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