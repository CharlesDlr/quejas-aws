const yup = require("yup")

const updateAuditorSchema = yup.object({
    nombre: yup.string().matches(/^[aA-zZ\s]/, "Ingrese correctamente el nombre del ejecutivo").required(),
    sucursal: yup.string().matches(/^[0-9]/, 'Ingrese el número de la sucursal').required()
})

module.exports = updateAuditorSchema;