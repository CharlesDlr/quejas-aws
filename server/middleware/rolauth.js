const pool = require("../db");

module.exports = async (req, res, next) => {
    const prueba = await pool.query("select rol from usuarios where usuario_id=$1", [req.user.id])
    const rol = prueba.rows[0].rol
    if (req.baseUrl === "/superadmin") {
        if (rol === "SuperAdmin") {
        } else return res.status(401).send("No tienes permiso, lo siento...");
    } else if (req.baseUrl === "/CM") {
        if (rol === "SuperAdmin" ||rol === "CM") {
        } else return res.status(401).send("No tienes permiso, lo siento...");
    } else if (req.baseUrl === "/ejecutivo") {
        if (rol === "SuperAdmin" || rol === "Ejecutivo") {
        } else return res.status(401).send("No tienes permiso, lo siento...");
    } else if (req.baseUrl == "/auditor") {
        if (rol === "SuperAdmin" || rol === "Auditor") {
        } else return res.status(401).send("No tienes permiso, lo siento...");
    }
    next();
  };