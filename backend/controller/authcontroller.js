const User = require('../models/Usermodel');
const bcrypt = require("bcryptjs");
const generateToken = require('../libs/Tokengenerator');
const logActivity = require('../libs/logger');

module.exports.signup = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    const Setting = require('../models/Settingmodel');
    const settingsList = await Setting.find();
    const settings = settingsList.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const minPassLen = Number(settings.min_password_length || 6);
    if (password.length < minPassLen) {
      return res.status(400).json({ error: `Password must be at least ${minPassLen} characters long.` });
    }

    const requestedRole = (role || 'STAFF').trim().toUpperCase();

    const duplicatedUser = await User.findOne({ email });
    if (duplicatedUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedpassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      full_name,
      email,
      password: hashedpassword,
      role: requestedRole,
      status: 'ACTIVE',
      profile_image: req.body.profile_image || null
    });

    const savedUser = await newUser.save();

    await logActivity({
      action: "USERSIGNUP",
      description: `User ${full_name} signed up as ${requestedRole}.`,
      entity: "user",
      entityId: savedUser._id,
      userId: req.user ? req.user._id : savedUser._id,
      ipAddress: req.ip,
    });

    const token = await generateToken(savedUser, res);

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: savedUser._id,
        full_name: savedUser.full_name,
        email: savedUser.email,
        role: savedUser.role,
        status: savedUser.status,
        profile_image: savedUser.profile_image,
        token,
      },
    });

  } catch (error) {
    res.status(400).json({ error: "Error during signup: " + error.message });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "No user found with those credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'INACTIVE') {
      return res.status(403).json({ message: 'Account is inactive. Please contact administrator.' });
    }

    const Setting = require('../models/Settingmodel');
    const settingsList = await Setting.find();
    const settings = settingsList.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    const sessionTimeout = Number(settings.session_timeout || 60);
    user.sessionTimeout = sessionTimeout;

    const token = await generateToken(user, res);

    await logActivity({
      action: "USERLOGIN",
      description: `User ${user.full_name} logged in.`,
      entity: "user",
      entityId: user._id,
      userId: user._id,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status,
        profile_image: user.profile_image
      }
    });

  } catch (error) {
    res.status(500).json({ error: "Error in login" });
  }
};

module.exports.logout = async (req, res) => {
  try {
    res.cookie("Inventorymanagmentsystem", '', { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed', error: error.message });
  }
};

module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

module.exports.removeuser = async (req, res) => {
  try {
    const { UserId } = req.params;
    const currentUserId = req.user?._id;

    if (UserId === currentUserId?.toString()) {
      return res.status(400).json({ message: "Admin cannot deactivate their own account." });
    }

    const deactivatedUser = await User.findByIdAndUpdate(UserId, { status: 'INACTIVE' }, { new: true });
    if (!deactivatedUser) return res.status(404).json({ message: "User not found" });

    await logActivity({
      action: "USERDEACTIVATE",
      description: `User ${deactivatedUser.full_name} was deactivated by Admin.`,
      entity: "user",
      entityId: deactivatedUser._id,
      userId: currentUserId,
      ipAddress: req.ip,
    });

    return res.status(200).json({ message: "User deactivated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.userCounts = async (req, res) => {
  try {
    const counts = await User.aggregate([
      { $match: { status: 'ACTIVE' } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);
    const result = { ADMIN: 0, STAFF: 0 };
    counts.forEach((c) => {
      if (c._id === "ADMIN") result.ADMIN = c.count;
      if (c._id === "STAFF") result.STAFF = c.count;
    });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.checkUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status,
        profile_image: user.profile_image
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.updateUserSecret = async (req, res) => {
  try {
    const { userId, full_name, email, role, status, password } = req.body;
    const normalizedRole = (role || 'STAFF').trim().toUpperCase();
    const updateData = {
      full_name,
      email,
      role: normalizedRole,
      status,
      profile_image: req.body.profile_image
    };

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    await logActivity({
      action: "USERUPDATE",
      description: `User ${updatedUser.full_name} updated by Admin.`,
      entity: "user",
      entityId: updatedUser._id,
      userId: req.user?._id,
      ipAddress: req.ip,
    });

    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

module.exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { full_name, password, profile_image } = req.body;

    const updateData = {};
    if (full_name) updateData.full_name = full_name;
    if (profile_image !== undefined) updateData.profile_image = profile_image; // Allow setting to null

    if (password && password.trim() !== "") {
      const Setting = require('../models/Settingmodel');
      const settingsList = await Setting.find();
      const settings = settingsList.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      const minPassLen = Number(settings.min_password_length || 6);

      if (password.length < minPassLen) {
        return res.status(400).json({ message: `Password must be at least ${minPassLen} characters long.` });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");

    await logActivity({
      action: "USERPROFILEUPDATE",
      description: `User ${updatedUser.full_name} updated their profile.`,
      entity: "user",
      entityId: updatedUser._id,
      userId: userId,
      ipAddress: req.ip,
    });

    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
