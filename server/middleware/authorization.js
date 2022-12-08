const jwt = require ("jsonwebtoken");
require("dotenv").config();

module.exports = async (req,res,next) => {
    try {
        //Obtain the token from the server
        const jwtToken = req.header("token");
        if (!jwtToken) {
            return res.status(403).json("Sin token no puedes acceder");
        }
        //To acces specific routes
        const payload = jwt.verify(jwtToken, process.env.jwtSecret)
        req.user = payload.user;
        next();
    } catch (err) {
        console.error(err.message);
        return res.status(403).json("No tienes acceso, lo siento");
    }
}