
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Feedback model
const Feedback = mongoose.model(
  "Feedback",
  new mongoose.Schema({
    courseName: { type: String, required: true },
    courseDuration: { type: String, default: "" },
    comments: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 }
  })
);

// Test route
// Test route
app.get("/", (req, res) => {
    res.send("Feedback Admin API is running!");
});

// Temporary feedback test
app.get("/feedback", async (req, res) => {
  try {
    const feedback = await Feedback.find({});
    res.json(feedback);
  } catch (error) {
    console.error("GET ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// Get all feedback


// Add feedback
app.post("/feedback", async (req, res) => {
  try {
    const feedback = await Feedback.create(req.body);
    res.status(201).json(feedback);
  } catch (error) {
    console.error("POST ERROR:", error.message);
    res.status(400).json({ message: error.message });
  }
});

// Update feedback
app.put("/feedback/:id", async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json(feedback);
  } catch (error) {
    console.error("PUT ERROR:", error.message);
    res.status(400).json({ message: error.message });
  }
});

// Delete feedback
app.delete("/feedback/:id", async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("DELETE ERROR:", error.message);
    res.status(400).json({ message: error.message });
  }
});

// Connect to MongoDB, then start server
async function startServer() {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is missing from the backend .env file");
    }

    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Connected Successfully!");

    app.listen(5000, () => {
      console.log("Backend running on port 5000");
    });
  } catch (error) {
    console.error("STARTUP ERROR:", error.message);
  }
}

startServer();
