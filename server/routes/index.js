const express = require('express');

const app = express();

//recoge las rutas del usuario
app.use(require('./usuario'));
//recoge las rutas del login
app.use(require('./login'));


module.exports = app;