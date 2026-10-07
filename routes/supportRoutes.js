const express = require("express");
const router = express.Router();

const SupportMessage = require("../models/supportMessage");

router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "Please fill out all fields"
      });
    }

    const supportMessage = new SupportMessage({
      name,
      email,
      subject,
      message
    });

    await supportMessage.save();

    res.status(201).json({
      message: "Message sent successfully!"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to send message"
    });
  }
});

module.exports = router;