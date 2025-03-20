const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const mongoose = require("mongoose");

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }

    // Generate username from email if not provided
    const finalUsername = username || email.split('@')[0];

    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Check if username already exists
    const usernameExists = await User.findOne({ username: finalUsername });
    if (usernameExists) {
      return res.status(400).json({ error: "Username already taken" });
    }

    console.log(`Registering new user: ${finalUsername}, email: ${email}`);

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log(`Password hashed successfully for ${finalUsername}`);

    // Create new user
    const newUser = new User({
      username: finalUsername,
      email,
      password: hashedPassword,
      name: name || finalUsername
    });

    // Save user to database
    await newUser.save();
    console.log(`User ${finalUsername} saved to database`);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return success with token
    res.status(201).json({
      message: "User registered successfully",
      token,
      username: newUser.username,
      email: newUser.email
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    // Log entire request body for debugging
    console.log("Login request body:", req.body);
    
    const { identifier, password } = req.body;

    // Validate required fields
    if (!identifier || !password) {
      console.error(`Missing required fields. Identifier: ${!!identifier}, Password: ${!!password}`);
      return res.status(400).json({ error: "Email/username and password are required" });
    }

    console.log(`Login attempt with identifier: ${identifier}`);

    // Check if user exists by email or username
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier }
      ]
    });

    if (!user) {
      console.log(`No user found with identifier: ${identifier}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log(`User found: ${user.username}`);

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Password mismatch for user: ${user.username}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log(`Login successful for user: ${user.username}`);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return success with token
    res.json({
      message: "Login successful",
      token,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
};

// Verify JWT token middleware
exports.verifyToken = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user data to request
    req.user = decoded;
    
    // Continue to next middleware
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    // Get user from database (exclude password)
    const user = await User.findById(req.user.userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Return user data
    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Please enter a valid email address" });
      }
      
      // Check if email is already in use by another user
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.userId } });
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { name, email } },
      { new: true }
    ).select("-password");
    
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Return updated user data
    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Save quiz result to user history
exports.saveQuizResult = async (req, res) => {
  try {
    const { subject, topic, score, totalQuestions } = req.body;
    
    // Validate required fields
    if (!subject || score === undefined || !totalQuestions) {
      return res.status(400).json({ error: "Subject, score, and totalQuestions are required" });
    }
    
    // Find user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Generate a new quiz ID
    const quizId = new mongoose.Types.ObjectId();
    
    // Check if a similar quiz result was saved in the last minute
    // This helps prevent duplicate entries from frontend double-submissions
    const recentTime = new Date(Date.now() - 60 * 1000); // 1 minute ago
    const recentDuplicate = user.quizHistory.find(item => 
      item.subject === subject && 
      item.topic === (topic || '') && 
      item.score === score && 
      item.totalQuestions === totalQuestions &&
      new Date(item.date) > recentTime
    );
    
    if (recentDuplicate) {
      console.log("Prevented duplicate quiz result submission");
      // Return success with existing history
      return res.json({
        message: "Quiz result already saved",
        quizHistory: user.quizHistory
      });
    }
    
    // Add quiz result to user history
    user.quizHistory.push({
      quizId,
      subject,
      topic: topic || '',
      score,
      totalQuestions,
      date: new Date()
    });
    
    // Save updated user
    await user.save();
    
    // Return success
    res.json({
      message: "Quiz result saved successfully",
      quizHistory: user.quizHistory
    });
  } catch (error) {
    console.error("Save quiz result error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
