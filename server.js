const express = require("express");
const cors = require("cors");
const supportRoutes = require("./routes/supportRoutes");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/support", supportRoutes);

// Serve CSS, JavaScript, images, etc. from public
app.use(express.static("public"));

// Pug setup
app.set("view engine", "pug");
app.set("views", "./views");

// Routes
const exerciseRoutes = require("./routes/exerciseRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/api/exercises", exerciseRoutes);
app.use("/api/auth", authRoutes);

// Homepage
app.get("/", (req, res) => {
    res.render("index");
});

// MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });

// Start server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});