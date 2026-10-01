const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
    category: String,
    name: String,
    muscle: [String],
    equipment: [String],
    imageUrl: String,
    videoUrl: String
});

module.exports = mongoose.model("Exercise", exerciseSchema);