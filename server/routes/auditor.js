const router = require("express").Router();
const authorize = require("../middleware/authorization");
const pool = require("../db");
const rolauth = require("../middleware/rolauth");
//Auditor
router.get("/quejasauditor", authorize, rolauth, async (req, res) => {
  try {
    const page = req.query.page || 1
    const limit = req.query.items || 10
    const prueba = await pool.query("select rol from usuarios where usuario_id=$1", [req.user.id])
    const rol = prueba.rows[0].rol
    if (rol === "SuperAdmin") {
      res.json("Especifique la sucursal por favor...")
    } else {
      const sucursal =  await pool.query("Select sucursal_id from auditores where usuario_id=$1", [req.user.id])
      const quejas = await pool.query("select q.queja_id Id, s.nombre Sucursal, e.nombre Ejecutivo, tq.nombre TipoQueja, q.descr Descripción, q.fecha Fecha, q.estatus from quejas q inner join ejecutivos e  on e.ejecutivo_id=q.ejecutivo_id inner join sucursales s  on e.sucursal_id=s.sucursal_id inner join origen o on q.origen_id=o.origen_id inner join tipo_queja tq on tq.tipo_queja_id=q.tipo_queja_id where s.sucursal_id=$1 order by Id asc limit $2 offset $3;", [sucursal.rows[0].sucursal_id,limit,(limit*(page-1))]);
      res.json(quejas.rows);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})
module.exports = router;