const express = require("express");
const app = express ();
const cors = require("cors");

//Midleware
app.use(express.json());
app.use(cors());

//ROUTES
//Register and Login Routes
app.use("/auth", require("./routes/jwtAuth"));
//SuperAdmin
app.use("/superadmin", require("./routes/superadmin"))
//Auditor
app.use("/auditor", require("./routes/auditor"))
//Community Manager
app.use("/CM", require("./routes/cm"))
//Ejecutivo
app.use("/ejecutivo", require("./routes/ejecutivo"))

app.listen(5000, () => {
    console.log("El servidor anda Jalando en el puerto 5000 Charles, FIERRO");
});