const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const validInfo = require("../middleware/validInfo");

//Register route
router.post("/register", validInfo, async (req, res) => {
    try {
        //1.- Divide the req.body and actually use it
        const {nombre,email,password,rol} = req.body
        //2.- Define if the user exists
        const user = await pool.query("select * from usuarios where email = $1", [email]);
        //If not, let the user know that email is not registered
        if (user.rows.length > 0) {
            return res.status(401).json("Correo electrónico ya registrado")
        }
        //3.- Bycrypt the password with the .env file
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const bcryptPassword = await bcrypt.hash(password, salt);
        //4.- Insert the user into the DB
        const newUser = await pool.query("insert into usuarios (nombre, email, password, rol) values ($1,$2,$3,$4) returning *", [nombre, email, bcryptPassword,rol]);
        //5.- Create the JWT
        const token = jwtGenerator(newUser.rows[0].usuario_id);
        res.json({token});
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});


//Login Route
router.post("/login", validInfo, async (req, res) => {
    try {
        //1.- Divide the req.body and actually use it
        const  {email, password} = req.body;
        //2.- Define if the user exists
        const user = await pool.query("Select * from usuarios where email = $1", [email]);
        //If not, let the user know that email is not registered
        if  (user.rows.length === 0) {
            return res.status(401).json("Este correo no ha sido registrado");
        }
        //3.- Define if the password is the same as the one registered in the DB by making the reverse encryption
        //If not, let the user know
        const validPass = await bcrypt.compare(password, user.rows[0].password);
        if (!validPass) {
            return res.status(401).json("Contraseña incorrecta");
        }
        //4.- DCreate the JWT
        const token = jwtGenerator(user.rows[0].usuario_id);
        res.json({token});
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error"); 
    }
});

module.exports = router;