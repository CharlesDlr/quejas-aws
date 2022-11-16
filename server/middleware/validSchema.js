const validSchema = (schema) => async (req, res, next) => {
    try {
        await schema.validate(req.body, {abortEarly: false})
        next()
    } catch (error) {
        return res.status(400).json({message: error.message, errors: error.errors});
    }
}
module.exports = validSchema