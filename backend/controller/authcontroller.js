const User = require('../models/Usermodel');
const bcrypt = require("bcryptjs");
const generateToken = require('../libs/Tokengenerator');
const Cloundinary = require('../libs/Cloundinary');
const logActivity = require('../libs/logger');

module.exports.signup = async (req, res) => {
  try {
    const { name, username, email, password, phone, role } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { role: requestedRole } = req.body;
    const userRole = (requestedRole || 'STAFF').trim().toUpperCase();

    const duplicatedUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (duplicatedUser) {
      const field = duplicatedUser.email === email ? "Email" : "Username";
      return res.status(400).json({ error: `${field} already exists` });
    }

    const hashedpassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      email,
      phone: phone || "",
      password: hashedpassword,
      role: userRole,
      status: 'ACTIVE',
      profilePic: ""
    });

    const savedUser = await newUser.save();

    // Create activity log
    await logActivity({
      action: "USERSIGNUP",
      description: `User ${name} (@${username}) signed up as ${userRole}.`,
      entity: "user",
      entityId: savedUser._id,
      userId: req.user ? req.user._id : savedUser._id,
      ipAddress: req.ip,
    });

    // If it's an admin creating a user, don't generate token for the new user for the admin
    // but the original logic returns user + token. We'll keep compatibility.
    const token = await generateToken(savedUser, res);

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role,
        status: savedUser.status,
        profilePic: savedUser.profilePic,
        token,
      },
    });

  } catch (error) {
    console.error("Error during signup:", error.message);
    res.status(400).json({ error: "Error during signup: " + error.message });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body; // Could be email or username
    const user = await User.findOne({
      $or: [{ email: email }, { username: email }]
    });

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

    const token = await generateToken(user, res);

    await logActivity({
      action: "USERLOGIN",
      description: `User ${user.name} logged in.`,
      entity: "user",
      entityId: user._id,
      userId: user._id,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        profilePic: user.profilePic
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

module.exports.updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body; // Expect camelCase
    const userId = req.user?._id;

    if (!userId) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    if (profilePic) {
      const uploadResponse = await Cloundinary.uploader.upload(profilePic, {
        folder: "profile_inventory_system",
        upload_preset: "upload",
      });

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: uploadResponse.secure_url },
        { new: true }
      );

      return res.status(200).json({
        message: "Profile updated successfully",
        updatedUser
      });
    }
  } catch (error) {
    console.error("Profile update error", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports.staffuser = async (req, res) => {
  try {
    const staffuser = await User.find({ role: "STAFF" }).select("-password");
    res.status(200).json(staffuser);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

module.exports.adminuser = async (req, res) => {
  try {
    const adminuser = await User.find({ role: "ADMIN" }).select("-password");
    res.status(200).json(adminuser);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
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

    // Prevent self-deletion
    if (UserId === currentUserId?.toString()) {
      return res.status(400).json({ message: "Admin cannot delete their own account." });
    }

    const deleteUser = await User.findByIdAndDelete(UserId);
    if (!deleteUser) return res.status(404).json({ message: "User not found" });

    await logActivity({
      action: "USERDELETE",
      description: `User ${deleteUser.name} (@${deleteUser.username}) was deleted by Admin.`,
      entity: "user",
      entityId: deleteUser._id,
      userId: currentUserId,
      ipAddress: req.ip,
    });

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.userCounts = async (req, res) => {
  try {
    const counts = await User.aggregate([
      { $match: {} },
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
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        profilePic: user.profilePic,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.updateUserSecret = async (req, res) => {
  try {
    const { userId, name, username, email, phone, role, status, password } = req.body;
    const normalizedRole = (role || 'STAFF').trim().toUpperCase();
    const updateData = { name, username, email, phone, role: normalizedRole, status };

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    await logActivity({
      action: "USERUPDATE",
      description: `User ${updatedUser.name} updated by Admin.`,
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
