const jwt = require('jsonwebtoken');
require('dotenv').config();
module.exports = (role) => {
    return (req, res, next) => {
        const authHeader = req.get('Authorization');
        if (!authHeader) {
            const error = new Error('Not authenticated');
            error.statuCode = 401;
            throw error;
        }
        const token = authHeader.replace('Bearer ', '');
        console.log("token", token);
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
        } catch (err) {
            err.statusCode = 401;
            throw err;
        }
        if (!decodedToken) {
            const error = new Error('Not authenticated');
            error.statuCode = 401;
            throw error;
        }
        if (role && decodedToken.role !== role) {
            const error = new Error('Not authorized');
            error.statusCode = 403;
            throw error;
        }
        req.userId = decodedToken.userId;
        req.userRole = decodedToken.role;
        next();
    };
};