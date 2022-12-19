create database quejasvl;
\c quejasvl;

create table sucursales (
sucursal_id serial primary key,
nombre varchar(100) unique,
estatus bit);

create type rol_actual as enum ('Ejecutivo', 'CM', 'SuperAdmin', 'Auditor');

create table usuarios (
usuario_id serial primary key,
nombre varchar(100) not null,
email varchar(100) unique not null,
password varchar(100) not null,
rol rol_actual not null);

create table ejecutivos (
ejecutivo_id serial primary key,
sucursal_id int not null,
telefono varchar(20),
estatus bit,
foreign key (sucursal_id) references sucursales (sucursal_id)) inherits (usuarios);

create table auditores (
auditor_id serial primary key,
sucursal_id int not null,
foreign key (sucursal_id) references sucursales (sucursal_id)) inherits (usuarios);

create table origen (
origen_id serial primary key,
nombre varchar(50) unique not null);

create table tipo_queja (
tipo_queja_id serial primary key,
nombre varchar(100) unique,
abreviatura varchar (10) unique,
estatus bit);

create table quejas (
queja_id serial primary key,
sucursal_id int,
ejecutivo_id int,
tipo_queja_id int,
descr varchar(400),
fecha TIMESTAMP DEFAULT now(),
estatus bit,
origen_id int,
nombre_usuario varchar(100),
telefono varchar(20),
foreign key (sucursal_id) references sucursales (sucursal_id),
foreign key (ejecutivo_id) references ejecutivos (ejecutivo_id),
foreign key (tipo_queja_id) references tipo_queja (tipo_queja_id),
foreign key (origen_id) references origen (origen_id));

create table cambio_estatus (
cambio_estatus_id serial primary key,
fecha TIMESTAMP DEFAULT now(),
estado varchar(50),
responsable varchar(100),
comentario varchar(100),
queja_id int,
usuario_id int,
foreign key (queja_id) references quejas (queja_id));


select descr, fecha
from quejas
where extract(month from fecha)>8 and
extract(month from fecha)<12 and
extract(day from fecha)>12 and
extract(day from fecha)<20;