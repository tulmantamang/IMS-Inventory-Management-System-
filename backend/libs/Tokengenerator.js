const jwt = require('jsonwebtoken');

require('dotenv').config();


const generateToken = async (user, res) => {
  try {
    // Accept multiple possible env var names for JWT secret for flexibility
    const secretKey = process.env.SecretKey || process.env.JWT_SECRET || process.env.Secret || 'devsecret';

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      secretKey,
      { expiresIn: '7d' }
    );

    console.log("Generated JWT:", token); 

    // Cookie options: use secure and SameSite=None in production only.
    // For local development set secure=false and sameSite='Lax' so cookies work over http://localhost.
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie("Inventorymanagmentsystem", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: isProd ? 'None' : 'Lax',
      secure: !!isProd,
    });
    

    return token; 
  } catch (error) {
    console.error("Error generating token:", error.message);
    throw new Error("Failed to generate token");
  }
};

module.exports=generateToken;