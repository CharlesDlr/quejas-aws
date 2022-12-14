const router = require("express").Router();
const authorize = require("../middleware/authorization");
const pool = require("../db");
const rolauth = require("../middleware/rolauth");
const quejasSchema = require("../middleware/ValidationSchemas/quejasSchema");
const cambiodeestatusSchema = require("../middleware/ValidationSchemas/cambiodeestatusSchema");
const validSchema = require("../middleware/validSchema");
//Flujo Community Manager
function pages (contador, limit) {
  if (contador.rows[0].count%limit != 0) {
      return totPage = Math.floor((contador.rows[0].count/limit)+1)
    } else  return totPage = contador.rows[0].count/limit
}
//To see Quejas Externas
router.get("/quejasexternas", authorize, rolauth, async (req, res) => {
    try {
      const page = req.query.page || 1
      const limit = req.query.items || 10
      const by = req.query.by || 'Id'
      const dir = req.query.dir || 'asc'
      const status = req.query.status || 1
      const contador = await pool.query("select count(queja_id) from quejas where estatus=$1", [status])
      const quejas = await pool.query("select queja_id Id, s.nombre Sucursal, e.nombre Ejecutivo, tq.nombre TipoQueja, q.descr Descripción, q.fecha Fecha, q.estatus Estatus, o.nombre Origen, q.nombre_usuario NombreUsuario, q.telefono Teléfono from quejas q inner join ejecutivos e on e.ejecutivo_id=q.ejecutivo_id inner join sucursales s on e.sucursal_id=s.sucursal_id inner join origen o on q.origen_id=o.origen_id inner join tipo_queja tq on tq.tipo_queja_id=q.tipo_queja_id where q.estatus=$1 order by "+by+ " " +dir+" limit $2 offset $3;", [status, limit, (limit*(page-1))]);
      res.json({Complaints: quejas.rows, Conteo: contador.rows[0].count, Helper: "Página " + page + " de " + pages(contador, limit)});
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
})

//Filtrar quejas por sucursal
router.get("/quejas/:sucursal", authorize, rolauth, async (req, res) => {
    try {
      const page = req.query.page || 1
      const limit = req.query.items || 10
      const by = req.query.by || 'Id'
      const dir = req.query.dir || 'asc'
      const status = req.query.status || 1
      const sucursal = req.params.sucursal
      const contador = await pool.query("select count(queja_id) from quejas where sucursal_id=$1 and estatus=$2", [sucursal, status])
      const quejas = await pool.query("select queja_id Id, s.nombre Sucursal, e.nombre Ejecutivo, tq.nombre TipoQueja, q.descr Descripción, q.fecha Fecha, q.estatus Estatus, o.nombre Origen, q.nombre_usuario NombreUsuario, q.telefono Teléfono from quejas q inner join ejecutivos e on e.ejecutivo_id=q.ejecutivo_id inner join sucursales s on e.sucursal_id=s.sucursal_id inner join origen o on q.origen_id=o.origen_id inner join tipo_queja tq on tq.tipo_queja_id=q.tipo_queja_id where s.sucursal_id=$1 and q.estatus=$2 order by "+by+ " " +dir+" limit $3 offset $4;", [sucursal, status, limit, (limit*(page-1))]);
      res.json({Complaints: quejas.rows, Conteo: contador.rows[0].count, Helper: "Página " + page + " de " + pages(contador, limit)});
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
})

//Filtrar quejas por ejecutivo
router.get("/quejase/:ejecutivo", authorize, rolauth, async (req, res) => {
    try {
      const page = req.query.page || 1
      const limit = req.query.items || 10
      const by = req.query.by || 'Id'
      const dir = req.query.dir || 'asc'
      const status = req.query.status || 1
      const ejecutivo =  await pool.query("Select ejecutivo_id from ejecutivos where usuario_id=$1", [req.params.ejecutivo])
      const contador = await pool.query("select count(queja_id) from quejas where ejecutivo_id=$1 and estatus=$2", [ejecutivo.rows[0].ejecutivo_id, status])
      const quejas = await pool.query("select queja_id Id, s.nombre Sucursal, e.nombre Ejecutivo, tq.nombre TipoQueja, q.descr Descripción, q.fecha Fecha, q.estatus Estatus, o.nombre Origen, q.nombre_usuario NombreUsuario, q.telefono Teléfono from quejas q inner join ejecutivos e on e.ejecutivo_id=q.ejecutivo_id inner join sucursales s on e.sucursal_id=s.sucursal_id inner join origen o on q.origen_id=o.origen_id inner join tipo_queja tq on tq.tipo_queja_id=q.tipo_queja_id where e.ejecutivo_id=$1 and q.estatus=$2 order by "+by+ " " +dir+" limit $3 offset $4;", [ejecutivo.rows[0].ejecutivo_id, status, limit, (limit*(page-1))]);
      res.json({Complaints: quejas.rows, Conteo: contador.rows[0].count, Helper: "Página " + page + " de " + pages(contador, limit)});
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
})
  
//Filtrar quejas por tipo de quejas
router.get("/quejastq/:tipoqueja", authorize, rolauth, async (req, res) => {
    try {
      const page = req.query.page || 1
      const limit = req.query.items || 10
      const by = req.query.by || 'Id'
      const dir = req.query.dir || 'asc'
      const status = req.query.status || 1
      const contador = await pool.query("select count(queja_id) from quejas where tipo_queja_id=$1 and estatus=$2", [req.params.tipoqueja, status])
      const quejas = await pool.query("select queja_id Id, s.nombre Sucursal, e.nombre Ejecutivo, tq.nombre TipoQueja, q.descr Descripción, q.fecha Fecha, q.estatus Estatus, o.nombre Origen, q.nombre_usuario NombreUsuario, q.telefono Teléfono from quejas q inner join ejecutivos e on e.ejecutivo_id=q.ejecutivo_id inner join sucursales s on e.sucursal_id=s.sucursal_id inner join origen o on q.origen_id=o.origen_id inner join tipo_queja tq on tq.tipo_queja_id=q.tipo_queja_id where q.tipo_queja_id=$1 and q.estatus=$2 order by "+by+ " " +dir+" limit $3 offset $4;", [req.params.tipoqueja, status, limit, (limit*(page-1))]);
      res.json({Complaints: quejas.rows, Conteo: contador.rows[0].count, Helper: "Página " + page + " de " + pages(contador, limit)});
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
})

//To see Cambio de estatus
router.get("/cambio/:queja", authorize, rolauth, async (req, res) => {
    try {
      const check = await pool.query("select * from quejas where queja_id=$1;", [req.params.queja])
      if (check.rowCount === 0) {
        res.json("Esta queja no existe...")
      } else {
        const quejas = await pool.query("select ce.cambio_estatus_id, ce.fecha, ce.estado, ce.responsable, ce.comentario, u.nombre autor from cambio_estatus ce inner join usuarios u on ce.usuario_id = u.usuario_id where queja_id=$1;", [req.params.queja]);
        if(quejas.rowCount === 0) {
        return res.json("Esta queja no tiene cambio de estatus...")
        } else res.json(quejas.rows);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
})

//To add Cambio de estatus
router.post("/cambio/:queja", authorize, rolauth, validSchema(cambiodeestatusSchema), async (req, res) => {
  try {
    const queja_inicial= await pool.query("Select * from quejas where queja_id=$1", [req.params.queja])
    const quejas = await pool.query("select fecha, estado, responsable from cambio_estatus where queja_id=$1;", [req.params.queja]);
    if (queja_inicial.rowCount === 0 ){
      return res.json("Esta queja no existe...")
    } else if(quejas.rowCount > 0) {
      return res.json("Esta queja ya tiene un cambio de estatus...")
    } else {
      const {estado, responsable, comentario} = req.body;
      const cambio = await pool.query("Insert into cambio_estatus (estado, responsable, queja_id, comentario, usuario_id) values ($1, $2, $3, $4, $5) returning queja_id, estado, responsable, comentario, usuario_id", [estado, responsable, req.params.queja, comentario, req.user.id])
      res.json(cambio.rows);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//To update a cambio de estatus
router.put("/cambio/:queja", authorize, rolauth, validSchema(cambiodeestatusSchema), async (req, res) => {
  try {
    const queja_inicial= await pool.query("Select * from quejas where queja_id=$1", [req.params.queja])
    if (queja_inicial.rowCount === 0 ){
      return res.json("Esta queja no existe...")
    } else {
      const {estado, responsable, comentario} = req.body;
      const cambio = await pool.query("Update cambio_estatus set estado=$1, responsable=$2, comentario=$3 where queja_id=$4 returning queja_id, estado, responsable, comentario", [estado, responsable, comentario, req.params.queja])
      res.json(cambio.rows);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//To delete a cambio de estatus
router.delete("/cambio/:queja", authorize, rolauth, async (req, res) => {
  try {
    const queja_inicial= await pool.query("Select * from quejas where queja_id=$1", [req.params.queja])
    if (queja_inicial.rowCount === 0 ){
      return res.json("Esta queja no existe...")
    } else {
      await pool.query("delete from cambio_estatus where queja_id=$1", [req.params.queja])
      res.json("El cambio de estatus fue eliminado");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//Create a queja
router.post("/quejasexternas", authorize, rolauth, validSchema(quejasSchema), async (req, res) => {
  try {
    const {ejecutivo, sucursal, tipoqueja, descr, estatus, origen, nombreusuario, telefono} = req.body;
      const check = await pool.query ("Select * from ejecutivos where ejecutivo_id=$1", [ejecutivo])
      const verifyTipoQueja = await pool.query("Select * from tipo_queja where tipo_queja_id=$1", [tipoqueja])
      const verifyOrigen= await pool.query("Select * from origen where origen_id=$1", [origen])
      if (verifyOrigen.rowCount === 0) {
        res.status(707).send("Este origen no existe")
      } else if (verifyTipoQueja.rowCount === 0) {
        res.status(707).send("Este tipo de queja no existe")
      } else if (check.rowCount === 0) {
        res.status(707).send("Este ejecutivo no existe")
      } else if (check.rows[0].sucursal_id != sucursal) {
        res.status(707).send("Este ejecutivo no pertenece a esta sucursal")
      } else {
        const newQueja = await pool.query("insert into quejas (ejecutivo_id, sucursal_id, tipo_queja_id, descr, estatus, origen_id, nombre_usuario, telefono) values ($1,$2,$3,$4,$5,$6,$7, $8) returning *", [ejecutivo, sucursal, tipoqueja, descr, estatus, origen, nombreusuario, telefono]);
        res.json(newQueja.rows);
      }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//Update a queja
router.put("/quejasexternas/:queja", authorize, rolauth, validSchema(quejasSchema), async (req, res) => {
  try {
      const queja = await pool.query("select * from quejas where queja_id=$1;", [req.params.queja])
      if (queja.rowCount === 0) {
        res.json("Esta queja no existe...")
      } else {
        const {sucursal, ejecutivo, tipoqueja, descr, estatus, origen, nombreusuario, telefono} = req.body;
        const check = await pool.query ("Select * from ejecutivos where ejecutivo_id=$1", [ejecutivo])
        const verifyTipoQueja = await pool.query("Select * from tipo_queja where tipo_queja_id=$1", [tipoqueja])
        const verifyOrigen= await pool.query("Select * from origen where origen_id=$1", [origen])
        if (verifyOrigen.rowCount === 0) {
          res.status(707).send("Este origen no existe")
        } else if (verifyTipoQueja.rowCount === 0) {
          res.status(707).send("Este tipo de queja no existe")
        } else if (check.rowCount === 0) {
          res.status(707).send("Este ejecutivo no existe")
        } else if (check.rows[0].sucursal_id != sucursal) {
          res.status(707).send("Este ejecutivo no pertenece a esta sucursal")
        } else {
          await pool.query("Update quejas set sucursal_id=$1, ejecutivo_id=$2, tipo_queja_id=$3, descr=$4, estatus=$5, origen_id=$6, nombre_usuario=$7, telefono=$8 where queja_id=$9 returning *", [sucursal, ejecutivo, tipoqueja, descr, estatus, origen, nombreusuario, telefono, req.params.queja]);
          res.json("Queja Actualizada");
        }
      }
  } catch (err) {
      console.error(err.message);
  }
})

//To delete a queja
router.delete("/quejasexternas/:queja", authorize, rolauth, async (req, res) => {
    try {
        const check = await pool.query("select * from quejas where queja_id=$1;", [req.params.queja])
        if (check.rowCount === 0) {
        res.json("Esta queja no existe...")
        } else {
          await pool.query("delete from quejas where queja_id=$1 returning *", [req.params.queja])
          res.json("La queja fue eliminada");
        }
    } catch (err) {
      console.error(err.message);
    }
});
module.exports = router;