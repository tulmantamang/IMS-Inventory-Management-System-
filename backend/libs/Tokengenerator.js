const jwt = require('jsonwebtoken');

require('dotenv').config();


const generateToken = async (user, res) => {
  try {
    // Accept multiple possible env var names for JWT secret for flexibility
    const secretKey = process.env.SecretKey || process.env.JWT_SECRET || process.env.Secret || 'devsecret';

    const expiresIn = user.sessionTimeout ? `${user.sessionTimeout}m` : '7d';

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      secretKey,
      { expiresIn }
    );

    console.log(`Generated JWT (expires in ${expiresIn}):`, token);

    // Cookie options
    const isProd = process.env.NODE_ENV === 'production';
    const maxAge = user.sessionTimeout ? user.sessionTimeout * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

    res.cookie("Inventorymanagmentsystem", token, {
      maxAge: maxAge,
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

module.exports = generateToken;