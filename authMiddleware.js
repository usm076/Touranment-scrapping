const jwt = require('jsonwebtoken');
const User = require('./models/User');

const jwtAuth = async (req, res, next) => {
    const token = req.headers['x-auth'];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

module.exports = jwtAuth;