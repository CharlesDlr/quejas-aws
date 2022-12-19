-- Inserting example data to test
insert into sucursales (nombre, estatus) values ('Tlaquepaque', '1');
insert into sucursales (nombre, estatus) values ('Palomar', '1');
insert into sucursales (nombre, estatus) values ('Tijuana', '1');
insert into sucursales (nombre, estatus) values ('León', '0');
insert into sucursales (nombre, estatus) values ('Aguascalientes', '0');

-- Inserting example data to test
insert into origen (nombre) values ('Facebook');
insert into origen (nombre) values ('Instagram');
insert into origen (nombre) values ('WhatsApp');

-- Inserting example data to test
insert into tipo_queja (nombre, abreviatura, estatus) values ('No responde correctamente','NR','1');
insert into tipo_queja (nombre, abreviatura, estatus) values ('No lee la conversación','NL','0');
insert into tipo_queja (nombre, abreviatura, estatus) values ('No atiende mensajes','NAM','1');

-- Inserting example data to test
insert into quejas (ejecutivo_id, sucursal_id, tipo_queja_id, descr, estatus, origen_id, nombre_usuario, telefono) values
(1,1,1,'No se le dio respuesta al cliente', '1', 1, 'Sheldon', '33-3333-3333');
insert into quejas (ejecutivo_id, sucursal_id, tipo_queja_id, descr, estatus, origen_id, nombre_usuario, telefono) values
(2,2,2,'Recibió información equivoca', '1', 2, 'Rajesh', '33-3333-3333');
insert into quejas (ejecutivo_id, sucursal_id, tipo_queja_id, descr, estatus, origen_id, nombre_usuario, telefono) values
(3,3,3,'Le mandaron info de Cabo y no de Cancún', '1', 3, 'Leonard', '33-3333-3333');
insert into quejas (ejecutivo_id, sucursal_id, tipo_queja_id, descr, estatus, origen_id, nombre_usuario, telefono) values
(4,4,1,'No se le brindó el correcto seguimiento al cliente', '1', 1, 'Penny', '33-3333-3333');

-- Inserting example data to test
insert into cambio_estatus (estado, responsable, comentario, queja_id, usuario_id)
values ('Terminado','Charlitos', 'Comentario Prueba', 1, 7);