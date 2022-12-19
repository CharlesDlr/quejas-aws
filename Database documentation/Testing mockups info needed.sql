-- Flujo Admin
-- Quejas Externas
select queja_id Id, s.nombre Sucursal, e.nombre Ejecutivos, tq.nombre TipoQueja, q.descr Descripción, q.fecha Fecha, q.estatus Estatus, o.nombre Origen, q.nombre_usuario NombreUsuario, q.telefono Teléfono
from quejas q
inner join ejecutivos e  on e.ejecutivo_id=q.ejecutivo_id
inner join sucursales s  on e.sucursal_id=s.sucursal_id
inner join origen o 	 on q.origen_id=o.origen_id
inner join tipo_queja tq on tq.tipo_queja_id=q.tipo_queja_id;
-- Cambio de Estatus
select c.fecha, c.estado, c.responsable
from cambio_estatus c
inner join quejas q on c.queja_id=q.queja_id;
-- Sucursales
select sucursal_id, nombre, estatus
from sucursales;
-- Tipos de Quejas
select tipo_queja_id, nombre, abreviatura, estatus
from tipo_queja;
-- Admin Ejecutivos
select s.nombre sucursal, e.nombre ejecutivo, e.telefono, e.estatus
from sucursales s
inner join ejecutivos e on s.sucursal_id=e.sucursal_id;

-- Flujo Ejecutivo
-- Quejas Externas/Quejas asignadas a mí
select q.queja_id Id, q.descr Descripción, q.fecha FechaAsignacion, q.estatus Todos, q.nombre_usuario nombreusuario, q.telefono Teléfono
from quejas q
inner join ejecutivos e on q.ejecutivo_id=e.ejecutivo_id
where e.ejecutivo_id=4;
-- Detalle cambio de estatus
update cambio_estatus set comentario='Escribe un comentario' where queja_id=1;
select c.comentario Comentario
from cambio_estatus c
inner join quejas q     on c.queja_id=q.queja_id
inner join ejecutivos e  on e.ejecutivo_id=q.ejecutivo_id
inner join sucursales s  on e.sucursal_id=s.sucursal_id;

-- Flujo CM
-- Quejas Externas
select queja_id Id, s.nombre Sucursal, e.nombre Ejecutivos, tq.nombre tipoqueja, q.descr Descripción, q.fecha FechaAsignacion, q.estatus Estatus, o.nombre Origen, q.nombre_usuario nombreusuario, q.telefono Teléfono
from quejas q
inner join ejecutivos e  on e.ejecutivo_id=q.ejecutivo_id
inner join sucursales s  on e.sucursal_id=s.sucursal_id
inner join origen o 	 on q.origen_id=o.origen_id
inner join tipo_queja tq on tq.tipo_queja_id=q.tipo_queja_id;
-- Detalle cambio de estatus
select c.fecha Fecha, c.fecha Fechanueva, c.responsable Responsable
from cambio_estatus c
inner join quejas q     on c.queja_id=q.queja_id
inner join ejecutivos e  on e.ejecutivo_id=q.ejecutivo_id
inner join sucursales s  on e.sucursal_id=s.sucursal_id;


-- Flujo Auditor
-- Quejas Externas
select q.queja_id Id, s.nombre Sucursal, e.nombre EjecutivoAsignado, tq.nombre Tipoqueja, q.descr Descripción, q.fecha FechaAsigancion, q.estatus Estatus
from quejas q
inner join ejecutivos e  on e.ejecutivo_id=q.ejecutivo_id
inner join sucursales s  on e.sucursal_id=s.sucursal_id
inner join tipo_queja tq on tq.tipo_queja_id=q.tipo_queja_id;