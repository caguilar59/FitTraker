require("dotenv").config();

const express = require("express");

const app = express();

app.use(express.json());

const exerciseRoutes = require("./routes/exerciseRoutes");

app.use("/api/exercises", exerciseRoutes);

app.get("/", (req, res) => {
    res.send("FitTraker API is running!");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});