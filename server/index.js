const express = require("express");
const app = express ();
const cors = require("cors");

//Midleware
app.use(express.json());
app.use(cors());

//ROUTES//
//Register and Login Routes
app.use("/auth", require("./routes/jwtAuth"));

app.use("/dashboard", require("./routes/dashboard"))

app.listen(5000, () => {
    console.log("El servidor anda Jalando en el puerto 5000 Charles, FIERRO");
});