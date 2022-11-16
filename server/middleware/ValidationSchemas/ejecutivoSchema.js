const yup = require("yup")

const ejecutivoSchema = yup.object({
    nombre: yup.string().matches(/^[aA-zZ\s]/, "Ingrese correctamente el nombre del ejecutivo").required(),
    email: yup.string().email().required(),
    password: yup.string().required(),
    sucursal: yup.string().matches(/^[0-9]/, 'Ingrese el número de la sucursal').required(),
    estatus: yup.number().test('Booleano','El estatus debe ser 1 o 0',(value) => value === 0 || value === 1).required(),
    telefono: yup.string().matches(/^[0-9]{10}$/, 'El teléfono debe tener 10 digitos').required()
})

module.exports = ejecutivoSchema;