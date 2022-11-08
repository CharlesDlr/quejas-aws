const pool = require("../db");

module.exports = async (req, res, next) => {
    const prueba = await pool.query("select rol from usuarios where usuario_id=$1", [req.user.id])
    const rol = prueba.rows[0].rol
    if (req.path === "/quejasexternas/" + req.params.idpage  || req.path === "/quejasexternas/" + req.params.idqueja ||
        req.path === "/quejascm/" + req.params.idsucursal    || req.path === "/quejascme/" + req.params.idejecutivo  ||
        req.path === "/quejascmtq/" + req.params.idtipoqueja || req.path === "/quejasexternas/cambio/" + req.params.idqueja) {
        if (rol === "SuperAdmin" || rol === "CM") {
        } else return res.status(401).send("No tienes permiso, lo siento...");
    } else if (req.path === "/sucursales" || req.path === "/sucursalesstats" || req.path === "/sucursales/" + req.params.idpage ||
               req.path === "/sucursales/" + req.params.idsucursal || req.path === "/sucursalessorted/" + req.params.idnombre) {
        if (rol === "SuperAdmin") {
        } else return res.status(401).send("No tienes permiso, lo siento...");
    } else if (req.path === "/tiposquejas" || req.path === "/tiposquejas/" + req.params.idtipoqueja) {
        if (rol === "SuperAdmin") {
        } else return res.status(401).send("No tienes permiso, lo siento...");
    } else if (req.path === "/ejecutivos" || req.path === "/ejecutivos/" + req.params.idejecutivo ||
               req.path === "/ejecutivosstats/"+ req.params.idpage) {
        if (rol === "SuperAdmin") {
        } else return res.status(401).send("No tienes permiso, lo siento...");
    } else if (req.path === "/ejecutivo" || req.path === "/ejecutivo/cambio/" + req.params.idqueja ||
               req.path === "/ejecutivo/cambioestatus/" + req.params.idqueja) {
        if (rol === "SuperAdmin" || rol === "Ejecutivo") {
        } else return res.status(401).send("No tienes permiso, lo siento...");
    } else if (req.path === "/quejasauditor/" + req.params.idsucursal) {
        if (rol === "SuperAdmin" || rol === "Auditor") {
        } else return res.status(401).send("No tienes permiso, lo siento...");
    }
    next();
  };