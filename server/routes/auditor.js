const router = require("express").Router();
const authorize = require("../middleware/authorization");
const pool = require("../db");
const rolauth = require("../middleware/rolauth");
//Auditor
function pages (contador, limit) {
  if (contador.rows[0].count%limit != 0) {
      return totPage = Math.floor((contador.rows[0].count/limit)+1)
    } else  return totPage = contador.rows[0].count/limit
}
router.get("/quejasauditor", authorize, rolauth, async (req, res) => {
  try {
    const prueba = await pool.query("select rol from usuarios where usuario_id=$1", [req.user.id])
    const rol = prueba.rows[0].rol
    if (rol === "SuperAdmin") {
      res.json("Especifique la sucursal por favor...")
    } else {
      const page = req.query.page || 1
      const limit = req.query.items || 10
      const by = req.query.by || 'Id'
      const dir = req.query.dir || 'asc'
      const status = req.query.status || 1
      const sucursal =  await pool.query("Select sucursal_id from auditores where usuario_id=$1", [req.user.id])
      const contador = await pool.query("select count(queja_id) from quejas where sucursal_id=$1 and estatus=$2", [sucursal.rows[0].sucursal_id, status])
      const quejas = await pool.query("select q.queja_id Id, s.nombre Sucursal, e.nombre Ejecutivo, tq.nombre TipoQueja, q.descr Descripción, q.fecha Fecha, q.estatus from quejas q inner join ejecutivos e  on e.ejecutivo_id=q.ejecutivo_id inner join sucursales s  on e.sucursal_id=s.sucursal_id inner join origen o on q.origen_id=o.origen_id inner join tipo_queja tq on tq.tipo_queja_id=q.tipo_queja_id where s.sucursal_id=$1 and q.estatus=$2 order by "+by+ " " +dir+" limit $3 offset $4;", [sucursal.rows[0].sucursal_id, status, limit,(limit*(page-1))]);
      res.json({Complaints: quejas.rows, Conteo: contador.rows[0].count, Helper: "Página " + page + " de " + pages(contador, limit)});
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})
module.exports = router;