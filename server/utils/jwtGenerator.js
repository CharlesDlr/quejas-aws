const jwt = require("jsonwebtoken");
require('dotenv').config();

//What actually generates the token by using the user_id as a parameter
function jwtGenerator(user_id) {
    const payload = {
        user: {
            id: user_id
        }
    };
    return jwt.sign(payload, process.env.jwtSecret, {expiresIn: 3600})
}

module.exports = jwtGenerator;