-- Inserting example data to test
insert into sucursales (nombre, estatus) values ('Tlaquepaque', '1');
insert into sucursales (nombre, estatus) values ('Palomar', '1');
insert into sucursales (nombre, estatus) values ('Tijuana', '1');
insert into sucursales (nombre, estatus) values ('León', '0');
insert into sucursales (nombre, estatus) values ('Aguascalientes', '0');

-- Inserting example data to test
insert into ejecutivos (nombre, sucursal_id, telefono, estatus) values ('Juan Ortega', 1, '449-180-06-23', '1');
insert into ejecutivos (nombre, sucursal_id, telefono, estatus) values ('Manue Medinal', 1, '549-180-06-23', '0');
insert into ejecutivos (nombre, sucursal_id, telefono, estatus) values ('Pedro Picapiedra', 2, '449-180-06-46', '1');
insert into ejecutivos (nombre, sucursal_id, telefono, estatus) values ('Pablo Lopez', 3, '449-180-06-46', '0');
insert into ejecutivos (nombre, sucursal_id, telefono, estatus) values ('Bernardo Barragan', 4, '449-180-06-46', '1');
insert into ejecutivos (nombre, sucursal_id, telefono, estatus) values ('Jesus Duran', 5, '449-180-06-46', '1');

-- Inserting example data to test
insert into origen (nombre) values ('Facebook');
insert into origen (nombre) values ('Instagram');
insert into origen (nombre) values ('WhatsApp');

-- Inserting example data to test
insert into tipo_queja (nombre, abreviatura, estatus) values ('No responde correctamente','NR','1');
insert into tipo_queja (nombre, abreviatura, estatus) values ('No lee la conversación','NL','0');
insert into tipo_queja (nombre, abreviatura, estatus) values ('No atiende mensajes','NAM','1');

-- Inserting example data to test
insert into quejas (sucursal_id, ejecutivo_id, tipo_queja_id, descr, estatus, origen_id, nombre_usuario, telefono) values
(2,6,1,'No se le dio respuesta al cliente', '1', 1, 'Sheldon', '33-3333-3333');
insert into quejas (ejecutivo_id, sucursal_id, tipo_queja_id, descr, estatus, origen_id, nombre_usuario, telefono) values
(2,1,2,'Recibió información equivoca', '1', 2, 'Rajesh', '33-3333-3333');
insert into quejas (ejecutivo_id, sucursal_id, tipo_queja_id, descr, estatus, origen_id, nombre_usuario, telefono) values
(3,2,3,'Le mandaron info de Cabo y no de Cancún', '1', 3, 'Leonard', '33-3333-3333');
insert into quejas (ejecutivo_id, sucursal_id, tipo_queja_id, descr, estatus, origen_id, nombre_usuario, telefono) values
(4,3,1,'No se le brindó el correcto seguimiento al cliente', '1', 1, 'Penny', '33-3333-3333');
insert into quejas (ejecutivo_id, sucursal_id, tipo_queja_id, descr, estatus, origen_id, nombre_usuario, telefono) values
(5,4,2,'Le mandaron info de Cabo y no de Cancún', '1', 2, 'Bernadette', '33-3333-3333');
insert into quejas (ejecutivo_id, sucursal_id, tipo_queja_id, descr, estatus, origen_id, nombre_usuario, telefono) values
(6,5,3,'No se le brindó el correcto seguimiento al cliente', '1', 3, 'Amy', '33-3333-3333');

-- Inserting example data to test
insert into cambio_estatus (estado, responsable, comentario, queja_id)
values ('Terminado','Charlitos', 'Comentario Prueba', 36);

select s.nombre, count(q.queja_id) quejas
from quejas q
inner join sucursales s on s.sucursal_id=q.sucursal_id
group by s.sucursal_id


select e.nombre, count(q.queja_id) quejas
from quejas q
inner join ejecutivos e on e.ejecutivo_id=q.ejecutivo_id
inner join sucursales s on s.sucursal_id=q.sucursal_id
where s.sucursal_id=1
group by e.nombre;