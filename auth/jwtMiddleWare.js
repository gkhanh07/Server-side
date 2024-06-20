const jwt = require('jsonwebtoken');
const member = require('../models/member');
function verifyJWT(req, res, next) {
    const token = req.cookies.jwt;

    if (!token) {
        res.locals.user = null;
        return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
            console.error('JWT verification error:', err.message);
            res.locals.user = null; // Clear user data if verification fails
        } else {
            console.log('decoded token:', decodedToken);
            const user = member.findById(decodedToken.id);
            res.locals.user = user;
            // Set user data from decoded token
        }
        next(); // Move to the next middleware
    });
}

module.exports = verifyJWT;