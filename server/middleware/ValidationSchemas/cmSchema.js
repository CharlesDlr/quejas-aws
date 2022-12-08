const yup = require("yup")

const cmSchema = yup.object({
    nombre: yup.string().matches(/^[aA-zZ\s]/, "Ingrese correctamente el nombre del ejecutivo").required(),
    email: yup.string().email().required(),
    password: yup.string().required()
})

module.exports = cmSchema;