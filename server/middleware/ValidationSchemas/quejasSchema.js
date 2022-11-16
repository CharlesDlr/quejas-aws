const yup = require("yup")

const quejasSchema = yup.object({
    sucursal: yup.string().matches(/^[0-9]/, 'Ingrese el número de la sucursal').required(),
    ejecutivo: yup.string().matches(/^[0-9]/, 'Ingrese el número del ejecutivo').required(),
    tipoqueja: yup.string().matches(/^[0-9]/, 'Ingrese el número de la queja').required(),
    descr: yup.string().required(),
    estatus: yup.number().test('Booleano','El estatus debe ser 1 o 0',(value) => value === 0 || value === 1).required(),
    origen: yup.string().matches(/^[0-9]/, 'Ingrese el número del ejecutivo').required(),
    nombreusuario: yup.string().matches(/^[aA-zZ\s]+$/, "Ingrese correctamente el nombre").required(),
    telefono: yup.string().matches(/^[0-9]{10}$/, 'El teléfono debe tener 10 digitos').required()
})

module.exports = quejasSchema;