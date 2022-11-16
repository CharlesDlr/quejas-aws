const yup = require("yup")

const cambiodeestatusSchema = yup.object({
    responsable: yup.string().matches(/^[aA-zZ\s]/, "Ingrese correctamente el nombre del responsable").required(),
    comentario: yup.string().matches(/^[aA-zZ\s]/, "Ingrese correctamente el comentario").required(),
    estado: yup.string().matches(/^[aA-zZ\s]/, "Ingrese correctamente el estado").required()
})

module.exports = cambiodeestatusSchema;