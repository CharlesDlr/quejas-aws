const yup = require("yup")

const updateCmSchema = yup.object({
    nombre: yup.string().matches(/^[aA-zZ\s]/, "Ingrese correctamente el nombre del ejecutivo").required()
})

module.exports = updateCmSchema;