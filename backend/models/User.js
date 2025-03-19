const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    unique: true, 
    required: true,
    trim: true 
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows null values to not trigger unique constraint
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  name: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  quizHistory: [{
    quizId: String,
    topic: String,
    score: Number,
    totalQuestions: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);
