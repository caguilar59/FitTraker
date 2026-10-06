require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

const exerciseRoutes = require("./routes/exerciseRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/api/exercises", exerciseRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("FitTraker API is running!");
});

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });

app.listen(3000, () => {
    console.log("Server running on port 3000");
});