const express = require('express');

const app = express();

//recoge las rutas del fichero usuario
app.use(require('./usuario'));
//recoge las rutas del fichero login
app.use(require('./login'));
//recoge las rutas del fichero categoria
app.use(require('./categoria'));
//recoge las rutas del fichero de producto
app.use(require('./producto'));
//recoge las rutas del fichero para subir ficheros
app.use(require('./upload'));
//código para visualizar imagenes
app.use(require('./imagenes'));


module.exports = app;