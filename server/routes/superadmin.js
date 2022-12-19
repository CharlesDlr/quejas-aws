const router = require("express").Router();
const authorize = require("../middleware/authorization");
const pool = require("../db");
const rolauth = require("../middleware/rolauth");
const bcrypt = require("bcrypt");
const quejasSchema = require("../middleware/ValidationSchemas/quejasSchema");
const validSchema = require("../middleware/validSchema");
const cambiodeestatusSchema = require("../middleware/ValidationSchemas/cambiodeestatusSchema");
const sucursalSchema = require("../middleware/ValidationSchemas/sucursalSchema");
const tipoquejaSchema = require("../middleware/ValidationSchemas/tipoquejaSchema");
const ejecutivoSchema = require("../middleware/ValidationSchemas/ejecutivoSchema");
const updateEjecutivoSchema = require("../middleware/ValidationSchemas/updateEjecutivoSchema");
const auditorSchema = require("../middleware/ValidationSchemas/auditorSchema");
const updateAuditorSchema = require("../middleware/ValidationSchemas/updateAuditorSchema");
const cmSchema = require("../middleware/ValidationSchemas/cmSchema");
const updateCmSchema = require("../middleware/ValidationSchemas/updateCmSchema");
//Flujo Admin
function pages (contador, limit) {
  if (contador.rows[0].count%limit != 0) {
      return totPage = Math.floor((contador.rows[0].count/limit)+1)
    } else  return totPage = contador.rows[0].count/limit
}
//To see Quejas Externas
router.get("/quejasexternas", authorize, rolauth, async (req, res) => {
  try {
    const verif = ["Id", "Sucursal", "Ejecutivo", "TipoQueja", "Descripción", "Fecha", "Estatus", "Origen", "Nombreusuario", "Teléfono"]
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
    const contador = await pool.query("select count(queja_id) from quejas where estatus=$1", [status])
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
    const quejas = await pool.query("select queja_id Id, s.nombre Sucursal, e.nombre Ejecutivo, tq.nombre TipoQueja, q.descr Descripción, q.fecha Fecha, q.estatus Estatus, o.nombre Origen, q.nombre_usuario NombreUsuario, q.telefono Teléfono from quejas q inner join ejecutivos e on e.ejecutivo_id=q.ejecutivo_id inner join sucursales s on e.sucursal_id=s.sucursal_id inner join origen o on q.origen_id=o.origen_id inner join tipo_queja tq on tq.tipo_queja_id=q.tipo_queja_id where q.estatus=$1 order by "+by+ " " +dir+" limit $2 offset $3;", [status, items, (items*(page-1))]);
    res.json({Complaints: quejas.rows, Conteo: contador.rows[0].count, Helper: "Página " + page + " de " + pages(contador, items)});
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
          await pool.query("Update quejas set sucursal_id=$1, ejecutivo_id=$2, tipo_queja_id=$3, descr=$4, estatus=$5, origen_id=$6, nombre_usuario=$7, telefono=$8 where queja_id=$9 returning *", [sucursal, ejecutivo, tipoqueja, descr, estatus, origen, nombreusuario, telefono, req.params.idqueja]);
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

//To see Sucursales
router.get("/sucursales", authorize, rolauth, async (req, res) => {
  try {
    var {page, items, by, dir, status} = req.query
    const verif = ["sucursal_id", "Estatus", "Nombre"]
    var byFlag=0
    verif.forEach(function(entry) {
      if (by!=entry) {
        byFlag++
      }
    })
    if (byFlag===verif.length) {
      by="sucursal_id"
    }
    if (isNaN(status) || status!=0){
      status=1
    }
    const contador = await pool.query("select count(sucursal_id) from sucursales where estatus=$1", [status])
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
    const sucursales = await pool.query("select * from sucursales where estatus =$1 order by "+by+ " " +dir+" limit $2 offset $3;", [status, items, (items*(page-1))]);
    res.json({Offices: sucursales.rows, Conteo: contador.rows[0].count,  Helper: "Página " + page + " de " + pages(contador, items)});
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//To see Sucursales and sort
router.get("/sucursalessorted", authorize, rolauth, async (req, res) => {
  try {
    const name = req.query.name || ''
    const sucursales = await pool.query("select * from sucursales where upper(unaccent(nombre)) like upper(unaccent('%" + name + "%'));");
    if (sucursales.rowCount === 0) {
      return res.json("No hay sucursales que coincidan con la búsqueda")
    } else res.json({Offices: sucursales.rows, Conteo: sucursales.rowCount});
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//To see Sucursales Statistics
router.get("/sucursalesstats", authorize, rolauth, async (req, res) => {
  try {
    var {page, items, by, dir, status} = req.query
    const verif = ["Sucursal", "Total"]
    var byFlag=0
    verif.forEach(function(entry) {
      if (by!=entry) {
        byFlag++
      }
    })
    if (byFlag===verif.length) {
      by="sucursal"
    }
    if (isNaN(status) || status!=0){
      status=1
    }
    const contador = await pool.query("select count(sucursal_id) from sucursales where estatus=$1", [status])
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
    const sucursales = await pool.query("SELECT S.NOMBRE Sucursal, COUNT(*) Total FROM QUEJAS Q INNER JOIN SUCURSALES S ON S.SUCURSAL_ID = Q.SUCURSAL_ID where q.estatus = $1 GROUP BY S.SUCURSAL_ID order by "+by+ " " +dir+" limit $2 offset $3;", [status, items, (items*(page-1))]);
    res.json({Offices: sucursales.rows, Conteo: contador.rows[0].count, Helper: "Página " + page + " de " + pages(contador, items)});
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//To add a Sucursal
router.post("/sucursales", authorize, rolauth, validSchema(sucursalSchema), async (req, res) => {
  try {
    const {nombre, estatus} = req.body;
    const newSucursal = await pool.query("insert into sucursales (nombre, estatus) values ($1,$2) returning *", [nombre, estatus]);
    res.json(newSucursal.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//Update a sucursal
router.put("/sucursales/:sucursal", authorize, rolauth, validSchema(sucursalSchema), async (req, res) => {
  try {
    if (isNaN(req.params.sucursal)) {
      return res.json("Ingrese un número de sucursal válido por favor")
    } else {
      const sucursal = await pool.query("Select * from sucursales where sucursal_id=$1", [req.params.sucursal])
      if (sucursal.rowCount === 0) {
        return res.json("Esta sucursal no existe...")
      } else {
        const {nombre, estatus} = req.body; 
        await pool.query("Update sucursales set nombre=$1, estatus=$2 where sucursal_id=$3 returning *", [nombre, estatus,req.params.sucursal]);
        res.json("Sucursal actualizada");
      }
    }
} catch (err) {
    console.error(err.message);
}
})

//To delete a Sucursal
router.delete("/sucursales/:sucursal", authorize, rolauth, async (req, res) => {
  try {
    const sucursal = await pool.query("Select * from sucursales where sucursal_id=$1", [req.params.sucursal])
    if (sucursal.rowCount === 0) {
      return res.json("Esta sucursal no existe...")
    } else {
      const ejecutivos = await pool.query("Select * from ejecutivos where sucursal_id=$1", [req.params.sucursal])
      if (ejecutivos.rowCount>0) {
        return res.json("Esta sucursal ya tiene ejecutivos patrón, no puedes borrarla...")
      } else {
        await pool.query("delete from sucursales where sucursal_id=$1", [req.params.sucursal])
        res.json("La sucursal fue eliminada");
      }
    }
  } catch (err) {
      console.error(err.message);
  }
});

//To see Tipos de Quejas
router.get("/tiposquejas", authorize, rolauth, async (req, res) => {
  try {
    const verif = ["tipo_queja_id", "nombre", "abreviatura", "estatus"]
    var {page, items, by, dir, status} = req.query
    var byFlag=0
    verif.forEach(function(entry) {
      if (by!=entry) {
        byFlag++
      }
    })
    if (byFlag===verif.length) {
      by="tipo_queja_id"
    }
    if (isNaN(status) || status!=0){
      status=1
    }
    const contador = await pool.query("select count(tipo_queja_id) from tipo_queja where estatus=$1", [status])
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
    const tiposquejas = await pool.query("select * from tipo_queja where estatus=$1 order by "+by+ " " +dir+" limit $2 offset $3;", [status, items, (items*(page-1))]);
    res.json({TypesofComplaints: tiposquejas.rows, Conteo: contador.rows[0].count, Helper: "Página " + page + " de " + pages(contador, items)});
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//Create a Tipo de queja
router.post("/tiposquejas", authorize, rolauth, validSchema(tipoquejaSchema), async (req, res) => {
  try {
    const {nombre, abreviatura, estatus} = req.body;
      const newTipoQueja = await pool.query("insert into tipo_queja (nombre, abreviatura, estatus) values ($1,$2,$3) returning *", [nombre, abreviatura, estatus]);
      res.json(newTipoQueja.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//Update Tipo de Queja
router.put("/tiposquejas/:tipoqueja", authorize, rolauth, async (req, res) => {
  try {
    const check = await pool.query("select * from tipo_queja where tipo_queja_id=$1;", [req.params.tipoqueja])
    if(check.rowCount === 0) {
      return res.json("Este tipo de queja no existe...")
    } else {
      const {nombre, abreviatura, estatus} = req.body;
      if (estatus!=0 && estatus!=1) {
        res.status(707).send("No puedes asignar un estatus diferente a 0 o 1")
      } else {
        await pool.query("Update tipo_queja set nombre=$1, abreviatura=$2, estatus=$3 where tipo_queja_id=$4 returning *", [nombre, abreviatura, estatus,req.params.tipoqueja]);
        res.json("Tipo de Queja Actualizada");
      }
    }
} catch (err) {
    console.error(err.message);
}
})

//Delete a Tipo de Queja
router.delete("/tiposquejas/:tipoqueja", authorize, rolauth, async (req, res) => {
  try {
    const tipoQueja = await pool.query("Select * from tipo_queja where tipo_queja_id=$1", [req.params.tipoqueja])
    if (tipoQueja.rowCount === 0) {
      return res.json("Este tipo de queja no existe...")
    } else {
      await pool.query("delete from tipo_queja where tipo_queja_id=$1 returning *", [req.params.tipoqueja])
      res.json("Este tipo de queja fue eliminada");
    }
  } catch (err) {
      console.error(err.message);
  }
});

//To see Ejecutivos
router.get("/ejecutivos", authorize, rolauth, async (req, res) => {
  try {
    const verif = ["Sucursal", "Ejecutivo", "Estatus", "Teléfono"]
    var {page, items, by, dir, status} = req.query
    var byFlag=0
    verif.forEach(function(entry) {
      if (by!=entry) {
        byFlag++
      }
    })
    if (byFlag===verif.length) {
      by="usuario_id"
    }
    if (isNaN(status) || status!=0){
      status=1
    }
    const contador = await pool.query("select count(*) from ejecutivos where estatus=$1", [status])
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
    const ejecutivos = await pool.query("select e.nombre ejecutivo, s.nombre sucursal, e.telefono, e.estatus from sucursales s inner join ejecutivos e on s.sucursal_id=e.sucursal_id where e.estatus=$1 order by "+by+ " " +dir+" limit $2 offset $3;", [status, items, (items*(page-1))]);
    res.json({Executives: ejecutivos.rows, Conteo: contador.rows[0].count, Helper: "Página " + page + " de " + pages(contador, items)});
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//To see Ejecutivos and sort by their name
router.get("/ejecutivossorted", authorize, rolauth, async (req, res) => {
  try {
    const name = req.query.name || ''
    const ejecutivos = await pool.query("select e.nombre ejecutivo, s.nombre sucursal, e.telefono, e.estatus from sucursales s inner join ejecutivos e on s.sucursal_id=e.sucursal_id WHERE UPPER(e.NOMBRE) like UPPER(UNACCENT('%"+ name +"%'));");
    if (ejecutivos.rowCount>0) {
      res.json({Executives: ejecutivos.rows, Conteo: ejecutivos.rowCount});
    } else res.json("No hay ejecutivos que coincidan con la búsqueda")
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//To see Ejecutivos Statistics
router.get("/ejecutivosstats", authorize, rolauth, async (req, res) => {
  try {
    const verif = ["nombre", "total"]
      var {page, items, by, dir, status} = req.query
      var byFlag=0
      verif.forEach(function(entry) {
        if (by!=entry) {
          byFlag++
        }
      })
      if (byFlag===verif.length) {
        by="e.nombre"
      }
      if (isNaN(status) || status!=0){
        status=1
      }
    const contador= await pool.query("Select count(distinct(e.nombre)) as Total from ejecutivos e inner join quejas q on q.ejecutivo_id=e.ejecutivo_id where q.estatus=$1", [status])
    if (contador.rows[0].total%items != 0) {
      totPage = Math.floor((contador.rows[0].total/items)+1)
    } else  totPage = contador.rows[0].total/items
    if (isNaN(page)) {
      page=1
    } else if (page>totPage) {
      page=totPage
    }
    if (isNaN(items)) {
      items=10
    } else if (items>contador) {
      items=contador
    }
    if (dir!="desc"){
      dir="asc"
    }
    const ejecutivos = await pool.query("select e.nombre, count(*) as Total from quejas q inner join sucursales s on s.sucursal_id=q.sucursal_id  inner join ejecutivos e on e.ejecutivo_id=q.ejecutivo_id where q.estatus=$1 group by e.nombre order by "+by+ " " +dir+" limit $2 offset $3;", [status, items,(items*(page-1))]);
    res.json({Executives: ejecutivos.rows, Conteo: contador.rows[0].total, Helper: "Página " + page + " de " + totPage});
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//To create Ejecutivo
router.post("/ejecutivos", authorize, rolauth, validSchema(ejecutivoSchema), async (req, res) => {
  try {
    const {nombre, email, password, sucursal, estatus, telefono} = req.body;
    const rol = 'Ejecutivo';
    const user = await pool.query("select * from usuarios where email = $1", [email]);
    const suc = await pool.query("select * from sucursales where sucursal_id=$1", [sucursal])
    if (user.rows.length > 0) {
      return res.status(401).json("Correo electrónico ya registrado")
    } else if (suc.rowCount === 0) {
      return res.status(707).send("Esta sucursal no existe")
    } else {
      const saltRound = 10;
      const salt = await bcrypt.genSalt(saltRound);
      const bcryptPassword = await bcrypt.hash(password, salt);
      const newEjecutivo = await pool.query("insert into ejecutivos (nombre, email, password, rol, sucursal_id, estatus, telefono) values ($1,$2,$3,$4,$5,$6,$7) returning *", [nombre, email, bcryptPassword, rol, sucursal, estatus, telefono]);
      res.json(newEjecutivo.rows);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//To update a Ejecutivo
router.put("/ejecutivos/:ejecutivo", authorize, rolauth, validSchema(updateEjecutivoSchema), async (req, res) => {
  try {
    const {nombre, sucursal, estatus, telefono} = req.body;
    const check = await pool.query("Select * from ejecutivos where ejecutivo_id=$1", [req.params.ejecutivo])
    const suc = await pool.query("select * from sucursales where sucursal_id=$1", [sucursal])
    if (check.rowCount === 0) {
      return res.json("Este ejecutivo no existe...")
    } else {
      if (suc.rowCount === 0) {
        return res.status(707).send("Esta sucursal no existe")
      } else {
        await pool.query("Update ejecutivos set nombre=$1, sucursal_id=$2, estatus=$3, telefono=$4 where ejecutivo_id=$5 returning *", [nombre, sucursal, estatus, telefono, req.params.ejecutivo]);
        res.json("Ejecutivo Actualizado");
      }
    }
} catch (err) {
    console.error(err.message);
}
})

//To delete a Ejecutivo
router.delete("/ejecutivos/:ejecutivo", authorize, rolauth, async (req, res) => {
  try {
    const ejecutivo = await pool.query("Select * from ejecutivos where ejecutivo_id=$1", [req.params.ejecutivo])
    if (ejecutivo.rowCount === 0) {
      return res.json("Este número de ejecutivo no existe...")
    } else {
      const ejecutivos = await pool.query("Select * from quejas where ejecutivo_id=$1", [req.params.ejecutivo])
      if (ejecutivos.rowCount>0) {
        return res.json("Este ejecutivo tiene quejas, no puedes borrarl...")
      } else {
        await pool.query("delete from ejecutivos where ejecutivo_id=$1", [req.params.ejecutivo])
        res.json("Este ejecutivo fue eliminado");
      }
    }
  } catch (err) {
      console.error(err.message);
  }
});

//To see Auditores
router.get("/auditores", authorize, rolauth, async (req, res) => {
  try {
    const verif = ["Sucursal", "Nombre"]
    var {page, items, by, dir, status} = req.query
    var byFlag=0
    verif.forEach(function(entry) {
      if (by!=entry) {
        byFlag++
      }
    })
    if (byFlag===verif.length) {
      by="nombre"
    }
    if (isNaN(status) || status!=0){
      status=1
    }
    const contador= await pool.query("Select count(*) from auditores")
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
    const auditores = await pool.query("SELECT au.NOMBRE,S.NOMBRE SUCURSAL FROM SUCURSALES S INNER JOIN auditores  au ON au.sucursal_id = S.sucursal_id order by "+by+ " " +dir+" limit $1 offset $2;", [items, (items*(page-1))]);
    res.json({Auditors: auditores.rows, Conteo: contador.rows[0].count,  Helper: "Página " + page + " de " + pages(contador, items)});
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//To create Auditor
router.post("/auditores", authorize, rolauth, validSchema(auditorSchema), async (req, res) => {
  try {
    const {nombre, email, password, sucursal} = req.body;
    const rol = 'Auditor';
    const user = await pool.query("select * from usuarios where email = $1", [email]);
    const suc = await pool.query("select * from sucursales where sucursal_id=$1", [sucursal])
    if (user.rows.length > 0) {
      return res.status(401).json("Correo electrónico ya registrado")
    } else if (suc.rowCount === 0) {
      return res.status(707).send("Esta sucursal no existe")
    } else {
      const saltRound = 10;
      const salt = await bcrypt.genSalt(saltRound);
      const bcryptPassword = await bcrypt.hash(password, salt);
      const newAuditor = await pool.query("insert into auditores (nombre, email, password, rol, sucursal_id) values ($1,$2,$3,$4,$5) returning *", [nombre, email, bcryptPassword, rol, sucursal]);
      res.json(newAuditor.rows);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//To update Auditor
router.put("/auditores/:auditor", authorize, rolauth, validSchema(updateAuditorSchema), async (req, res) => {
  try {
    const {nombre, sucursal} = req.body;
    const check = await pool.query("Select * from auditores where auditor_id=$1", [req.params.auditor])
    const suc = await pool.query("select * from sucursales where sucursal_id=$1", [sucursal])
    if (check.rowCount === 0) {
      return res.json("Este auditor no existe...")
    } else {
      if (suc.rowCount === 0) {
        return res.status(707).send("Esta sucursal no existe")
      } else {
        await pool.query("Update auditores set nombre=$1, sucursal_id=$2 where auditor_id=$3 returning *", [nombre, sucursal, req.params.auditor]);
        res.json("Auditor Actualizado");
      }
    }
} catch (err) {
    console.error(err.message);
}
})

//To delete Auditor
router.delete("/auditores/:auditor", authorize, rolauth, async (req, res) => {
  try {
    const auditor = await pool.query("Select * from auditores where auditor_id=$1", [req.params.auditor])
    if (auditor.rowCount === 0) {
      return res.json("Este número de auditor no existe...")
    } else {
      await pool.query("delete from auditores where auditor_id=$1", [req.params.auditor])
      res.json("Este auditor fue eliminado");
    }
  } catch (err) {
      console.error(err.message);
  }
});

//To see Community managers
router.get("/cm", authorize, rolauth, async (req, res) => {
  try {
    var {page, items, dir} = req.query
    const contador= await pool.query("Select count(*) from usuarios where rol='CM'")
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
    const cm = await pool.query("SELECT nombre from usuarios where rol='CM' order by nombre " +dir+" limit $1 offset $2;", [items, (items*(page-1))]);
    res.json({CommunityManagers: cm.rows, Conteo: contador.rows[0].count, Helper: "Página " + page + " de " + pages(contador, items)});
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//To create Community manager
router.post("/cm", authorize, rolauth, validSchema(cmSchema), async (req, res) => {
  try {
    const {nombre, email, password} = req.body;
    const rol = 'CM';
    const user = await pool.query("select * from usuarios where email = $1", [email]);
    if (user.rows.length > 0) {
      return res.status(401).json("Correo electrónico ya registrado")
    } else {
      const saltRound = 10;
      const salt = await bcrypt.genSalt(saltRound);
      const bcryptPassword = await bcrypt.hash(password, salt);
      const newCm = await pool.query("insert into usuarios (nombre, email, password, rol) values ($1,$2,$3,$4) returning *", [nombre, email, bcryptPassword, rol]);
      res.json(newCm.rows);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//To update Auditor
router.put("/cm/:cm", authorize, rolauth, validSchema(updateCmSchema), async (req, res) => {
  try {
    const check = await pool.query("Select * from usuarios where usuario_id=$1", [req.params.cm])
    if (check.rowCount === 0) {
      return res.json("Este auditor no existe...")
    } else {
        await pool.query("Update usuarios set nombre=$1 where usuario_id=$2 returning *", [req.body.nombre, req.params.cm]);
        res.json("Community manager Actualizado");
    }
} catch (err) {
    console.error(err.message);
}
})

//To delete Community manager
router.delete("/cm/:cm", authorize, rolauth, async (req, res) => {
  try {
    const check = await pool.query("Select * from usuarios where usuario_id=$1", [req.params.cm])
    if (check.rowCount === 0) {
      return res.json("Este número de community manager no existe...")
    } else {
      await pool.query("delete from usuarios where usuario_id=$1", [req.params.cm])
      res.json("Este CM fue eliminado");
    }
  } catch (err) {
      console.error(err.message);
  }
});
module.exports = router;