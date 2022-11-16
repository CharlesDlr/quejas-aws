const yup = require("yup")

const sucursalSchema = yup.object({
    nombre: yup.string().matches(/^[aA-zZ\s]/, "Ingrese correctamente el nombre de la sucursal").required(),
    estatus: yup.number().test('Booleano','El estatus debe ser 1 o 0',(value) => value === 0 || value === 1).required()
})

module.exports = sucursalSchema;