const express = require("express");
const router = express.Router();

const { getExercises } = require("../services/rapidAPI");

// GET all exercises
router.get("/", async (req, res) => {
    try {
        const exercises = await getExercises();

        res.json(exercises);

    } catch (error) {
        res.status(500).json({
            error: "Failed to get exercises"
        });
    }
});

module.exports = router;