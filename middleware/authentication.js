const User = require("../models/User");

const jwt = require("jsonwebtoken");

const { UnauthenticatedError } = require("../errors");
// const UnauthenticatedError = require("../errors/unauthenticated");

////////////////////////////////////////////////////////
const auth = async (req, res, next) => {
    // check header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
        throw new UnauthenticatedError("Authentication Invalid!");
        // throw new UnauthenticatedError("Authentication Invalid Test!");
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // attach the user to the job routes
        req.user = { userId: payload.userId, name: payload.name };

        next();
    } catch (error) {
        throw new UnauthenticatedError("Authentication Invalid!");
        // throw new UnauthenticatedError("Authentication Invalid Test!");
    }
};

////////////////////////////////////////////////////////
module.exports = auth;
