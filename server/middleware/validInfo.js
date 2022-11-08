module.exports = (req, res, next) => {
    const { email, nombre, password, rol } = req.body;
  
    //To make sure the user adds a valid email format using regexp
    function validEmail(userEmail) {
      return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail);
    }

    //To validate and let the user know when something is missing when registering
    if (req.path === "/register") {
      if (![email, nombre, password,rol].every(Boolean)) {
        return res.json("Llene todos los campos");
        //To let the user know the user the email is not in a valid format
      } else if (!validEmail(email)) {
        return res.json("El formato del correo electrónico no es el correcto");
      }
      //To validate and let the user know when something is missing when loggin in using the same logic than before
    } else if (req.path === "/login") {
      if (![email, password].every(Boolean)) {
        return res.json("Llene todo los campos");
      } else if (!validEmail(email)) {
        return res.json("El formato del correo electrónico no es el correcto");
      }
    }
    next();
  };