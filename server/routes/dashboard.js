const router = require("express").Router();
const authorize = require("../middleware/authorization");
const pool = require("../db");
const rolauth = require("../middleware/rolauth");
const bcrypt = require("bcrypt");
//Flujo Admin
//To see Quejas Externas
router.get("/quejasexternas/:idpage", authorize, rolauth, async (req, res) => {
  try {
    const idpage = req.params.idpage
    const quejas = await pool.query("select queja_id Id, s.nombre Sucursal, e.nombre Ejecutivo, tq.nombre TipoQueja, q.descr Descripción, q.fecha Fecha, q.estatus Estatus, o.nombre Origen, q.nombre_usuario NombreUsuario, q.telefono Teléfono from quejas q inner join ejecutivos e on e.ejecutivo_id=q.ejecutivo_id inner join sucursales s on e.sucursal_id=s.sucursal_id inner join origen o on q.origen_id=o.origen_id inner join tipo_queja tq on tq.tipo_queja_id=q.tipo_queja_id order by Id asc limit 10 offset $1;", [(10*(idpage-1))]);
    res.json(quejas.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//Filtrar quejas por sucursal
router.get("/quejascm/:idsucursal", authorize, rolauth, async (req, res) => {
  try {
    const idsucursal = req.params.idsucursal
    const quejas = await pool.query("select queja_id Id, s.nombre Sucursal, e.nombre Ejecutivo, tq.nombre TipoQueja, q.descr Descripción, q.fecha Fecha, q.estatus Estatus, o.nombre Origen, q.nombre_usuario NombreUsuario, q.telefono Teléfono from quejas q inner join ejecutivos e on e.ejecutivo_id=q.ejecutivo_id inner join sucursales s on e.sucursal_id=s.sucursal_id inner join origen o on q.origen_id=o.origen_id inner join tipo_queja tq on tq.tipo_queja_id=q.tipo_queja_id where s.sucursal_id=$1 order by Id asc;", [idsucursal]);
    res.json(quejas.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//Filtrar quejas por ejecutivo
router.get("/quejascme/:idejecutivo", authorize, rolauth, async (req, res) => {
  try {
    const ejecutivo =  await pool.query("Select ejecutivo_id from ejecutivos where usuario_id=$1", [req.params.idejecutivo])
    const quejas = await pool.query("select queja_id Id, s.nombre Sucursal, e.nombre Ejecutivo, tq.nombre TipoQueja, q.descr Descripción, q.fecha Fecha, q.estatus Estatus, o.nombre Origen, q.nombre_usuario NombreUsuario, q.telefono Teléfono from quejas q inner join ejecutivos e on e.ejecutivo_id=q.ejecutivo_id inner join sucursales s on e.sucursal_id=s.sucursal_id inner join origen o on q.origen_id=o.origen_id inner join tipo_queja tq on tq.tipo_queja_id=q.tipo_queja_id where e.ejecutivo_id=$1 order by Id asc;", [ejecutivo.rows[0].ejecutivo_id]);
    res.json(quejas.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//Filtrar quejas por tipo de quejas
router.get("/quejascmtq/:idtipoqueja", authorize, rolauth, async (req, res) => {
  try {
    const idtipoqueja = req.params.idtipoqueja
    const quejas = await pool.query("select queja_id Id, s.nombre Sucursal, e.nombre Ejecutivo, tq.nombre TipoQueja, q.descr Descripción, q.fecha Fecha, q.estatus Estatus, o.nombre Origen, q.nombre_usuario NombreUsuario, q.telefono Teléfono from quejas q inner join ejecutivos e on e.ejecutivo_id=q.ejecutivo_id inner join sucursales s on e.sucursal_id=s.sucursal_id inner join origen o on q.origen_id=o.origen_id inner join tipo_queja tq on tq.tipo_queja_id=q.tipo_queja_id where q.tipo_queja_id=$1 order by Id asc;", [idtipoqueja]);
    res.json(quejas.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//Create a queja
router.post("/quejasexternas", authorize, rolauth, async (req, res) => {
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
    } else if (estatus!=0 && estatus!=1) {
      res.status(707).send("No puedes asignar un estatus diferente a 0 o 1")
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
router.put("/quejasexternas/:idqueja", authorize, rolauth, async (req, res) => {
  try {
      const queja = await pool.query("select * from quejas where queja_id=$1;", [req.params.idqueja])
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
          await pool.query("Update quejas set sucursal_id=$1, ejecutivo_id=$2, tipo_queja_id=$3, descr=$4, estatus=$5, origen_id=$6, nombre_usuario=$7, telefono=$8 where queja_id=$9 returning *", [sucursal, ejecutivo, tipoqueja, descr, estatus, origen, nombreusuario, telefono, req.params.idqueja]);
          res.json("Queja Actualizada");
        }
      }
} catch (err) {
    console.error(err.message);
}
})

//To delete a queja
router.delete("/quejasexternas/:idqueja", authorize, rolauth, async (req, res) => {
  try {
      const check = await pool.query("select * from quejas where queja_id=$1;", [req.params.idqueja])
      if (check.rowCount === 0) {
        res.json("Esta queja no existe...")
      } else {
        await pool.query("delete from quejas where queja_id=$1 returning *", [req.params.idqueja])
        res.json("La queja fue eliminada");
      }
  } catch (err) {
      console.error(err.message);
  }
});

//To see Cambio de estatus
router.get("/quejasexternas/cambio/:idqueja", authorize, rolauth, async (req, res) => {
  try {
    const check = await pool.query("select * from quejas where queja_id=$1;", [req.params.idqueja])
      if (check.rowCount === 0) {
        res.json("Esta queja no existe...")
      } else {
        const quejas = await pool.query("select ce.cambio_estatus_id, ce.fecha, ce.estado, ce.responsable, ce.comentario, u.nombre from cambio_estatus ce inner join usuarios u on ce.usuario_id = u.usuario_id where queja_id=$1;", [req.params.idqueja]);
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
router.post("/quejasexternas/cambio/:idqueja", authorize, rolauth, async (req, res) => {
  try {
    const queja_inicial= await pool.query("Select * from quejas where queja_id=$1", [req.params.idqueja])
    const quejas = await pool.query("select fecha, estado, responsable from cambio_estatus where queja_id=$1;", [req.params.idqueja]);
    if (queja_inicial.rowCount === 0 ){
      return res.json("Esta queja no existe...")
    } else if(quejas.rowCount > 0) {
      return res.json("Esta queja ya tiene un cambio de estatus...")
    } else {
      const {estado, responsable, comentario} = req.body;
      const cambio = await pool.query("Insert into cambio_estatus (estado, responsable, queja_id, comentario, usuario_id) values ($1, $2, $3, $4, $5) returning queja_id, estado, responsable, comentario, usuario_id", [estado, responsable, req.params.idqueja, comentario, req.user.id])
      res.json(cambio.rows);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//To update a cambio de estatus
router.put("/quejasexternas/cambio/:idqueja", authorize, rolauth, async (req, res) => {
  try {
    const queja_inicial= await pool.query("Select * from quejas where queja_id=$1", [req.params.idqueja])
    if (queja_inicial.rowCount === 0 ){
      return res.json("Esta queja no existe...")
    } else {
      const {estado, responsable, comentario} = req.body;
      const cambio = await pool.query("Update cambio_estatus set estado=$1, responsable=$2, comentario=$3 where queja_id=$4 returning queja_id, estado, responsable, comentario", [estado, responsable, comentario, req.params.idqueja])
      res.json(cambio.rows);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//To delete a cambio de estatus
router.delete("/quejasexternas/cambio/:idqueja", authorize, rolauth, async (req, res) => {
  try {
    const queja_inicial= await pool.query("Select * from quejas where queja_id=$1", [req.params.idqueja])
    if (queja_inicial.rowCount === 0 ){
      return res.json("Esta queja no existe...")
    } else {
      await pool.query("delete from cambio_estatus where queja_id=$1", [req.params.idqueja])
      res.json("El cambio de estatus fue eliminado");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//To see Sucursales
router.get("/sucursales/:idpage", authorize, rolauth, async (req, res) => {
  try {
    const sucursales = await pool.query("select * from sucursales order by sucursal_id asc limit 10 offset $1;", [(10*(req.params.idpage-1))]);
    res.json(sucursales.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//To see Sucursales and sort
router.get("/sucursalessorted/:idnombre", authorize, rolauth, async (req, res) => {
  try {
    const sucursales = await pool.query("select * from sucursales where upper(nombre) like upper ('%" + req.params.idnombre + "%');");
    if (sucursales.rowCount === 0) {
      return res.json("No hay sucursales que coincidan con la búsqueda")
    } else res.json(sucursales.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//To see Sucursales Statistics
router.get("/sucursalesstats", authorize, rolauth, async (req, res) => {
  try {
    const sucursales = await pool.query("select s.nombre, count(*) quejas from quejas q inner join sucursales s on s.sucursal_id=q.sucursal_id group by s.sucursal_id;");
    res.json(sucursales.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//To add a Sucursal
router.post("/sucursales", authorize, rolauth, async (req, res) => {
  try {
    const {nombre, estatus} = req.body;
    if (estatus!=0 && estatus!=1) {
      res.status(707).send("No puedes asignar un estatus diferente a 0 o 1")
    } else {
      const newSucursal = await pool.query("insert into sucursales (nombre, estatus) values ($1,$2) returning *", [nombre, estatus]);
      res.json(newSucursal.rows); 
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//Update a sucursal
router.put("/sucursales/:idsucursal", authorize, rolauth, async (req, res) => {
  try {
    const sucursal = await pool.query("Select * from sucursales where sucursal_id=$1", [req.params.idsucursal])
    if (sucursal.rowCount === 0) {
      return res.json("Ests sucursal no existe...")
    } else {
      const {nombre, estatus} = req.body;
      if (estatus!=0 && estatus!=1) {
        res.status(707).send("No puedes asignar un estatus diferente a 0 o 1")
      } else {
        await pool.query("Update sucursales set nombre=$1, estatus=$2 where sucursal_id=$3 returning *", [nombre, estatus,req.params.idsucursal]);
        res.json("Sucursal Actualizada");
      }
    }
} catch (err) {
    console.error(err.message);
}
})

//To delete a Sucursal
router.delete("/sucursales/:idsucursal", authorize, rolauth, async (req, res) => {
  try {
    const sucursal = await pool.query("Select * from sucursales where sucursal_id=$1", [req.params.idsucursal])
    if (sucursal.rowCount === 0) {
      return res.json("Esta sucursal no existe...")
    } else {
      await pool.query("delete from sucursales where sucursal_id=$1", [req.params.idsucursal])
      res.json("La sucursal fue eliminada");
    }
  } catch (err) {
      console.error(err.message);
  }
});

//To see Tipos de Quejas
router.get("/tiposquejas", authorize, rolauth, async (req, res) => {
  try {
    const tiposquejas = await pool.query("select * from tipo_queja;");
    res.json(tiposquejas.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//Create a Tipo de queja
router.post("/tiposquejas", authorize, rolauth, async (req, res) => {
  try {
    const {nombre, abreviatura, estatus} = req.body;
    if (estatus!=0 && estatus!=1) {
      res.status(707).send("No puedes asignar un estatus diferente a 0 o 1")
    } else {
      const newTipoQueja = await pool.query("insert into tipo_queja (nombre, abreviatura, estatus) values ($1,$2,$3) returning *", [nombre, abreviatura, estatus]);
      res.json(newTipoQueja.rows);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//Update Tipo de Queja
router.put("/tiposquejas/:idtipoqueja", authorize, rolauth, async (req, res) => {
  try {
    const check = await pool.query("select * from tipo_queja where tipo_queja_id=$1;", [req.params.idtipoqueja])
    if(check.rowCount === 0) {
      return res.json("Este tipo de queja no existe...")
    } else {
      const {nombre, abreviatura, estatus} = req.body;
      if (estatus!=0 && estatus!=1) {
        res.status(707).send("No puedes asignar un estatus diferente a 0 o 1")
      } else {
        await pool.query("Update tipo_queja set nombre=$1, abreviatura=$2, estatus=$3 where tipo_queja_id=$4 returning *", [nombre, abreviatura, estatus,req.params.idtipoqueja]);
        res.json("Tipo de Queja Actualizada");
      }
    }
} catch (err) {
    console.error(err.message);
}
})

//Delete a Tipo de Queja
router.delete("/tiposquejas/:idtipoqueja", authorize, rolauth, async (req, res) => {
  try {
    const tipoQueja = await pool.query("Select * from tipo_queja where tipo_queja_id=$1", [req.params.idtipoqueja])
    if (tipoQueja.rowCount === 0) {
      return res.json("Este tipo de queja no existe...")
    } else {
      await pool.query("delete from tipo_queja where tipo_queja_id=$1 returning *", [req.params.idtipoqueja])
      res.json("Este tipo de queja fue eliminada");
    }
  } catch (err) {
      console.error(err.message);
  }
});

//To see Ejecutivos
router.get("/ejecutivos", authorize, rolauth, async (req, res) => {
  try {
    const ejecutivos = await pool.query("select s.nombre sucursal, e.nombre ejecutivo, e.telefono, e.estatus from sucursales s inner join ejecutivos e on s.sucursal_id=e.sucursal_id;");
    res.json(ejecutivos.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//To see Ejecutivos Statistics
router.get("/ejecutivosstats/:idpage", authorize, rolauth, async (req, res) => {
  try {
    const page = req.params.idpage
    const ejecutivos = await pool.query("select e.nombre, count(*) as quejas from quejas q inner join sucursales s on s.sucursal_id=q.sucursal_id  inner join ejecutivos e on e.ejecutivo_id=q.ejecutivo_id group by e.nombre limit 10 offset $1;", [(10*(page-1))]);
    res.json(ejecutivos.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//To create Ejecutivo
router.post("/ejecutivos", authorize, rolauth, async (req, res) => {
  try {
    const {nombre, email, password, sucursal, estatus, telefono} = req.body;
    const rol = 'Ejecutivo';
    const user = await pool.query("select * from ejecutivos where email = $1", [email]);
    const suc = await pool.query("select * from sucursales where sucursal_id=$1", [sucursal])
    if (user.rows.length > 0) {
      return res.status(401).json("Correo electrónico ya registrado")
    } else if (suc.rowCount === 0) {
      return res.status(707).send("Esta sucursal no existe")
    } else if (estatus!=0 && estatus!=1) {
      res.status(707).send("No puedes asignar un estatus diferente a 0 o 1")
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
router.put("/ejecutivos/:idejecutivo", authorize, rolauth, async (req, res) => {
  try {
    const {nombre, sucursal, estatus, telefono} = req.body;
    const check = await pool.query("Select * from ejecutivos where ejecutivo_id=$1", [req.params.idejecutivo])
    const suc = await pool.query("select * from sucursales where sucursal_id=$1", [sucursal])
    if (check.rowCount === 0) {
      return res.json("Este ejecutivo no existe...")
    } else {
      if (suc.rowCount === 0) {
        return res.status(707).send("Esta sucursal no existe")
      } else if (estatus!=0 && estatus!=1) {
        res.status(707).send("No puedes asignar un estatus diferente a 0 o 1")
      } else {
        await pool.query("Update ejecutivos set nombre=$1, sucursal_id=$2, estatus=$3, telefono=$4 where ejecutivo_id=$5 returning *", [nombre, sucursal, estatus, telefono, req.params.idejecutivo]);
        res.json("Ejecutivo Actualizado");
      }
    }
} catch (err) {
    console.error(err.message);
}
})

//To delete a Ejecutivo
router.delete("/ejecutivos/:idejecutivo", authorize, async (req, res) => {
  try {
    const ejecutivo = await pool.query("Select * from ejecutivos where ejecutivo_id=$1", [req.params.idejecutivo])
    if (ejecutivo.rowCount === 0) {
      return res.json("Este número de ejecutivo no existe...")
    } else {
      await pool.query("delete from ejecutivos where ejecutivo_id=$1", [req.params.idejecutivo])
      res.json("Este ejecutivo fue eliminado");
    }
  } catch (err) {
      console.error(err.message);
  }
});

//Flujo Ejecutivo
//To see only a Specific Ejecutivo Quejas
router.get("/ejecutivo", authorize, rolauth, async (req, res) => {
  try {
    const ejecutivos = await pool.query("select q.queja_id id, q.descr, q.fecha, q.estatus, q.nombre_usuario usuario, q.telefono from quejas q inner join ejecutivos e on q.ejecutivo_id=e.ejecutivo_id inner join usuarios u on e.nombre=u.nombre where u.usuario_id=$1 order by q.queja_id asc;", [req.user.id]);
    res.json(ejecutivos.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//To see detalle cambio de estatus
router.get("/ejecutivo/cambio/:idqueja", authorize, async (req, res) => {
  try {
    const ejecutivo =  await pool.query("Select ejecutivo_id from ejecutivos where usuario_id=$1", [req.user.id])
    const cambio_estatus = await pool.query("select ce.comentario, u.nombre Autor from cambio_estatus ce inner join quejas q on q.queja_id=ce.queja_id inner join usuarios u on u.usuario_id=ce.usuario_id where q.queja_id=$1 and q.ejecutivo_id=$2;", [req.params.idqueja, ejecutivo.rows[0].ejecutivo_id]);
    if (cambio_estatus.rowCount === 0) {
      res.status(401).send("Esta queja no tiene cambio de estatus...");
    } else {
      res.json(cambio_estatus.rows);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

//To update estatus de una queja
router.put("/ejecutivo/cambioestatus/:idqueja", authorize, async (req, res) => {
  try {
    const {estatus} = req.body;
    const nuevoestatus = await pool.query("Update quejas set estatus=$1 where queja_id=$2 returning queja_id, estatus", [estatus, req.params.idqueja]);
    res.json(nuevoestatus.rows[0]);
} catch (err) {
    console.error(err.message);
}
})

//To add comentarios to a queja
router.post("/ejecutivo/cambio/:idqueja", authorize, async (req, res) => {
  try {
    const {comentario} = req.body;
    await pool.query("Insert into cambio_estatus (comentario, queja_id, usuario_id) values ($1, $2, $3) returning *", [comentario, req.params.idqueja, req.user.id]);
    res.json("Comentario Insertado");
} catch (err) {
    console.error(err.message);
}
})



//Auditor
router.get("/quejasauditor/:idsucursal", authorize, rolauth, async (req, res) => {
  try {
    const quejas = await pool.query("select q.queja_id Id, s.nombre Sucursal, e.nombre Ejecutivo, tq.nombre TipoQueja, q.descr Descripción, q.fecha Fecha, q.estatus from quejas q inner join ejecutivos e  on e.ejecutivo_id=q.ejecutivo_id inner join sucursales s  on e.sucursal_id=s.sucursal_id inner join origen o on q.origen_id=o.origen_id inner join tipo_queja tq on tq.tipo_queja_id=q.tipo_queja_id where s.sucursal_id=$1;", [req.params.idsucursal]);
    res.json(quejas.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})
module.exports = router;