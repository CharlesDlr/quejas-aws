const router = require("express").Router();
const authorize = require("../middleware/authorization");
const pool = require("../db");
const rolauth = require("../middleware/rolauth");
const quejasSchema = require("../middleware/ValidationSchemas/quejasSchema");
const validSchema = require("../middleware/validSchema");
//Flujo Community Manager
//To see Quejas Externas
router.get("/quejasexternas", authorize, rolauth, async (req, res) => {
    try {
      const page = req.query.page || 1
      const limit = req.query.items || 10
      const quejas = await pool.query("select queja_id Id, s.nombre Sucursal, e.nombre Ejecutivo, tq.nombre TipoQueja, q.descr Descripción, q.fecha Fecha, q.estatus Estatus, o.nombre Origen, q.nombre_usuario NombreUsuario, q.telefono Teléfono from quejas q inner join ejecutivos e on e.ejecutivo_id=q.ejecutivo_id inner join sucursales s on e.sucursal_id=s.sucursal_id inner join origen o on q.origen_id=o.origen_id inner join tipo_queja tq on tq.tipo_queja_id=q.tipo_queja_id order by Id asc limit $1 offset $2;", [limit, (limit*(page-1))]);
      res.json(quejas.rows);
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
      const sucursal = req.params.sucursal
      const quejas = await pool.query("select queja_id Id, s.nombre Sucursal, e.nombre Ejecutivo, tq.nombre TipoQueja, q.descr Descripción, q.fecha Fecha, q.estatus Estatus, o.nombre Origen, q.nombre_usuario NombreUsuario, q.telefono Teléfono from quejas q inner join ejecutivos e on e.ejecutivo_id=q.ejecutivo_id inner join sucursales s on e.sucursal_id=s.sucursal_id inner join origen o on q.origen_id=o.origen_id inner join tipo_queja tq on tq.tipo_queja_id=q.tipo_queja_id where s.sucursal_id=$1 order by Id asc limit $2 offset $3;", [sucursal, limit, (limit*(page-1))]);
      res.json(quejas.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
})

//Filtrar quejas por ejecutivo
router.get("/quejas/:ejecutivo", authorize, rolauth, async (req, res) => {
    try {
      const page = req.query.page || 1
      const limit = req.query.items || 10
      const ejecutivo =  await pool.query("Select ejecutivo_id from ejecutivos where usuario_id=$1", [req.params.ejecutivo])
      const quejas = await pool.query("select queja_id Id, s.nombre Sucursal, e.nombre Ejecutivo, tq.nombre TipoQueja, q.descr Descripción, q.fecha Fecha, q.estatus Estatus, o.nombre Origen, q.nombre_usuario NombreUsuario, q.telefono Teléfono from quejas q inner join ejecutivos e on e.ejecutivo_id=q.ejecutivo_id inner join sucursales s on e.sucursal_id=s.sucursal_id inner join origen o on q.origen_id=o.origen_id inner join tipo_queja tq on tq.tipo_queja_id=q.tipo_queja_id where e.ejecutivo_id=$1 order by Id asc limit $2 offset $3;", [ejecutivo.rows[0].ejecutivo_id, limit, (limit*(page-1))]);
      res.json(quejas.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
})
  
//Filtrar quejas por tipo de quejas
router.get("/quejas/:tipoqueja", authorize, rolauth, async (req, res) => {
    try {
      const page = req.query.page || 1
      const limit = req.query.items || 10
      const quejas = await pool.query("select queja_id Id, s.nombre Sucursal, e.nombre Ejecutivo, tq.nombre TipoQueja, q.descr Descripción, q.fecha Fecha, q.estatus Estatus, o.nombre Origen, q.nombre_usuario NombreUsuario, q.telefono Teléfono from quejas q inner join ejecutivos e on e.ejecutivo_id=q.ejecutivo_id inner join sucursales s on e.sucursal_id=s.sucursal_id inner join origen o on q.origen_id=o.origen_id inner join tipo_queja tq on tq.tipo_queja_id=q.tipo_queja_id where q.tipo_queja_id=$1 order by Id asc limit $2 offset $3;", [req.params.tipoqueja, limit, (limit*(page-1))]);
      res.json(quejas.rows);
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
        } else if (estatus!=0 && estatus!=1) {
          res.status(707).send("No puedes asignar un estatus diferente a 0 o 1")
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