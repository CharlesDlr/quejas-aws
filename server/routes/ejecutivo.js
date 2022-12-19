const router = require("express").Router();
const authorize = require("../middleware/authorization");
const pool = require("../db");
const rolauth = require("../middleware/rolauth");
//Flujo Ejecutivo
function pages (contador, limit) {
  if (contador.rows[0].count%limit != 0) {
      return totPage = Math.floor((contador.rows[0].count/limit)+1)
    } else  return totPage = contador.rows[0].count/limit
}
//To see only a Specific Ejecutivo Quejas
router.get("/quejas", authorize, rolauth, async (req, res) => {
    try {
      const prueba = await pool.query("select rol from usuarios where usuario_id=$1", [req.user.id])
      const rol = prueba.rows[0].rol
      if (rol === "SuperAdmin") {
        res.json("Usted es SuperAdmin, no ejecutivo, especifique el ejecutivo...")
      } else {
        const verif = ["Id", "Descr", "Fecha", "Estatus", "Nombreusuario", "Teléfono"]
        var {page, items, by, dir, status} = req.query
        var byFlag=0
        verif.forEach(function(entry) {
          if (by!=entry) {
            byFlag++
          }
        })
        if (byFlag===verif.length) {
          by="Id"
        }
        if (isNaN(status) || status!=0){
          status=1
        }
        const ejecutivo =  await pool.query("Select ejecutivo_id from ejecutivos where usuario_id=$1", [req.user.id])
        const contador = await pool.query("Select count(queja_id) from quejas where ejecutivo_id=$1 and estatus=$2", [status, ejecutivo.rows[0].ejecutivo_id])
        if (isNaN(page)) {
          page=1
        } else if (page>pages(contador,items)) {
          page=pages(contador,items)
        }
        if (isNaN(items)) {
          items=10
        } else if (items>contador) {
          items=contador
        }
        if (dir!="desc"){
          dir="asc"
        }
        const quejas = await pool.query("select q.queja_id id, q.descr, q.fecha, q.estatus, q.nombre_usuario usuario, q.telefono from quejas q inner join ejecutivos e on q.ejecutivo_id=e.ejecutivo_id where q.ejecutivo_id=$1 and q.estatus=$2 order by "+by+ " " +dir+" limit $3 offset $4;", [ejecutivo.rows[0].ejecutivo_id, status, items, (items*(page-1))]);
        res.json({Complaints: quejas.rows, Conteo: contador.rows[0].count, Helper: "Página " + page + " de " + pages(contador, items)});
      }     
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  })
  
  //To see detalle cambio de estatus
  router.get("/cambio/:queja", authorize, rolauth, async (req, res) => {
    try {
      const prueba = await pool.query("select rol from usuarios where usuario_id=$1", [req.user.id])
    const rol = prueba.rows[0].rol
    if (rol === "SuperAdmin") {
      res.json("Usted es SuperAdmin, no ejecutivo, especifique el ejecutivo...")
    } else {
      const ejecutivo =  await pool.query("Select ejecutivo_id from ejecutivos where usuario_id=$1", [req.user.id])
      const verif = await pool.query("select * from quejas where queja_id=$1 and ejecutivo_id=$2",[req.params.queja, ejecutivo.rows[0].ejecutivo_id])
      if(verif.rowCount === 0) {
        res.json("Esta queja no te pertenece patrón, ojo ahí...")
      } else {
        const cambio_estatus = await pool.query("select ce.comentario, u.nombre Autor from cambio_estatus ce inner join quejas q on q.queja_id=ce.queja_id inner join usuarios u on u.usuario_id=ce.usuario_id where q.queja_id=$1 and q.ejecutivo_id=$2;", [req.params.queja, ejecutivo.rows[0].ejecutivo_id]);
      if (cambio_estatus.rowCount === 0) {
        res.status(401).send("Esta queja no tiene cambio de estatus...");
      } else {res.json(cambio_estatus.rows);}
      }
    }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  })
  
  //To update estatus de una queja
  router.put("/cambio/:queja", authorize, rolauth, async (req, res) => {
    try {
      const prueba = await pool.query("select rol from usuarios where usuario_id=$1", [req.user.id])
      const rol = prueba.rows[0].rol
      if (rol === "SuperAdmin") {
        res.json("Usted es SuperAdmin, no ejecutivo, especifique el ejecutivo...")
      } else {
        const ejecutivo =  await pool.query("Select ejecutivo_id from ejecutivos where usuario_id=$1", [req.user.id])
        const verif = await pool.query("select * from quejas where queja_id=$1 and ejecutivo_id=$2",[req.params.queja, ejecutivo.rows[0].ejecutivo_id])
        if(verif.rowCount === 0) {
          res.json("Esta queja no te pertenece patrón, ojo ahí...")
        } else {
          const {estatus} = req.body;
          const nuevoestatus = await pool.query("Update quejas set estatus=$1 where queja_id=$2 returning queja_id, estatus", [estatus, req.params.queja]);
          res.json(nuevoestatus.rows[0]);
        }
      }
  } catch (err) {
      console.error(err.message);
  }
  })
  
  //To add comentarios to a queja
  router.post("/cambio/:queja", authorize, rolauth, async (req, res) => {
    try {
      const prueba = await pool.query("select rol from usuarios where usuario_id=$1", [req.user.id])
      const rol = prueba.rows[0].rol
      if (rol === "SuperAdmin") {
        res.json("Usted es SuperAdmin, no ejecutivo, especifique el ejecutivo...")
      } else {
        const ejecutivo =  await pool.query("Select ejecutivo_id from ejecutivos where usuario_id=$1", [req.user.id])
        const verif = await pool.query("select * from quejas where queja_id=$1 and ejecutivo_id=$2",[req.params.queja, ejecutivo.rows[0].ejecutivo_id])
        if(verif.rowCount === 0) {
          res.json("Esta queja no te pertenece patrón, ojo ahí...")
        } else {
          const {comentario} = req.body;
          await pool.query("Insert into cambio_estatus (comentario, queja_id, usuario_id) values ($1, $2, $3) returning *", [comentario, req.params.queja, req.user.id]);
          res.json("Comentario Insertado");
        }
      }
  } catch (err) {
      console.error(err.message);
  }
  })
  module.exports = router;