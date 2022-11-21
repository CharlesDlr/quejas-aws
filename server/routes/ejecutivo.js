const router = require("express").Router();
const authorize = require("../middleware/authorization");
const pool = require("../db");
const rolauth = require("../middleware/rolauth");
//Flujo Ejecutivo
//To see only a Specific Ejecutivo Quejas
router.get("/quejas", authorize, rolauth, async (req, res) => {
    try {
      const ejecutivos = await pool.query("select q.queja_id id, q.descr, q.fecha, q.estatus, q.nombre_usuario usuario, q.telefono from quejas q inner join ejecutivos e on q.ejecutivo_id=e.ejecutivo_id inner join usuarios u on e.nombre=u.nombre where u.usuario_id=$1 order by q.queja_id asc;", [req.user.id]);
      res.json(ejecutivos.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  })
  
  //To see detalle cambio de estatus
  router.get("/cambio/:idqueja", authorize, rolauth, async (req, res) => {
    try {
      const ejecutivo =  await pool.query("Select ejecutivo_id from ejecutivos where usuario_id=$1", [req.user.id])
      const verif = await pool.query("select * from quejas where queja_id=$1 and ejecutivo_id=$2",[req.params.idqueja, ejecutivo.rows[0].ejecutivo_id])
      if(verif.rowCount === 0) {
        res.json("Esta queja no te pertenece patrón, ojo ahí...")
      } else {
        const cambio_estatus = await pool.query("select ce.comentario, u.nombre Autor from cambio_estatus ce inner join quejas q on q.queja_id=ce.queja_id inner join usuarios u on u.usuario_id=ce.usuario_id where q.queja_id=$1 and q.ejecutivo_id=$2;", [req.params.idqueja, ejecutivo.rows[0].ejecutivo_id]);
      if (cambio_estatus.rowCount === 0) {
        res.status(401).send("Esta queja no tiene cambio de estatus...");
      } else {
        res.json(cambio_estatus.rows);
      }
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  })
  
  //To update estatus de una queja
  router.put("/cambio/:idqueja", authorize, rolauth, async (req, res) => {
    try {
      const ejecutivo =  await pool.query("Select ejecutivo_id from ejecutivos where usuario_id=$1", [req.user.id])
      const verif = await pool.query("select * from quejas where queja_id=$1 and ejecutivo_id=$2",[req.params.idqueja, ejecutivo.rows[0].ejecutivo_id])
      if(verif.rowCount === 0) {
        res.json("Esta queja no te pertenece patrón, ojo ahí...")
      } else {
        const {estatus} = req.body;
        const nuevoestatus = await pool.query("Update quejas set estatus=$1 where queja_id=$2 returning queja_id, estatus", [estatus, req.params.idqueja]);
        res.json(nuevoestatus.rows[0]);
      }
  } catch (err) {
      console.error(err.message);
  }
  })
  
  //To add comentarios to a queja
  router.post("/cambio/:idqueja", authorize, rolauth, async (req, res) => {
    try {
      const ejecutivo =  await pool.query("Select ejecutivo_id from ejecutivos where usuario_id=$1", [req.user.id])
      const verif = await pool.query("select * from quejas where queja_id=$1 and ejecutivo_id=$2",[req.params.idqueja, ejecutivo.rows[0].ejecutivo_id])
      if(verif.rowCount === 0) {
        res.json("Esta queja no te pertenece patrón, ojo ahí...")
      } else {
        const {comentario} = req.body;
        await pool.query("Insert into cambio_estatus (comentario, queja_id, usuario_id) values ($1, $2, $3) returning *", [comentario, req.params.idqueja, req.user.id]);
        res.json("Comentario Insertado");
      }
  } catch (err) {
      console.error(err.message);
  }
  })
  module.exports = router;