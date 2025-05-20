const bcrypt = require('bcrypt');
const { getDB } = require('../config/db');
const { generateToken, googleClient } = require('../utils/auth');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

// Register a new user
const signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const { usersCollection } = getDB();
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Allow user to choose their own role (user or admin)
    let assignedRole = 'user';
    if (role === 'admin') {
      assignedRole = 'admin';
    } else if (role === 'user') {
      assignedRole = 'user';
    }

    // Create new user
    const newUser = {
      email,
      password: hashedPassword,
      name: email.split('@')[0],
      profilePic: '/default-avatar.png',  // Default profile picture
      isVerified: false,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      role: assignedRole
    };
    
    const result = await usersCollection.insertOne(newUser);
    
    // User data to return (exclude sensitive info)
    const userData = {
      id: result.insertedId,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    };
    
    // Generate JWT token
    const token = generateToken(result.insertedId);
    
    // Return success response
    res.status(201).json({
      success: true,
      user: userData,
      token
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
};

// Login with email and password
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { usersCollection, userLoginsCollection } = getDB();

    // Find user
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Log the login event
    await userLoginsCollection.insertOne({
      userId: user._id,
      email: user.email,
      timestamp: new Date()
    });

    // Return user data
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.status(200).json({
      success: true,
      user: userData,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// Google authentication
const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    const { usersCollection } = getDB();
    
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, name, email, picture } = payload;

    // Check if user exists
    let user = await usersCollection.findOne({ email });

    if (!user) {
      // Create new user
      const newUser = {
        googleId,
        name,
        email,
        avatar: picture,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: 'user'
      };

      const result = await usersCollection.insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    }

    // Return user data (without sensitive info)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role
    };

    res.status(200).json({
      success: true,
      user: userData,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const { usersCollection } = getDB();
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authorization required' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
      const userId = new ObjectId(decoded.id);
      
      const user = await usersCollection.findOne({ _id: userId });
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      // Include more user data in response
      const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        status: user.status || 'active', // Provide fallback for existing users
        createdAt: user.createdAt,
        avatar: user.avatar || null,
      };
      
      return res.json({
        success: true,
        user: userData
      });
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

module.exports = {
  signup,
  login,
  googleAuth,
  getProfile
};