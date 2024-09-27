const jwt = require("jsonwebtoken");
const User = require("../models/User");
require('dotenv').config()
const JWT_SECRET = process.env.JWT_SECRET


const authorizeUser = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Authentication required" })
    }
    const token = authorization.replace('Bearer ', '');
console.log(token);
    try {
        const payload = jwt.verify(token, JWT_SECRET)
        const user = await User.findByPk(payload.id)
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" })
        }
        req.user = user
        next()
    } catch (err) {
        console.error("Error during token verification or database lookup:", err)
        return res.status(401).json({ success: false, message: "Invalid credentials" })
    }
}

module.exports = authorizeUser