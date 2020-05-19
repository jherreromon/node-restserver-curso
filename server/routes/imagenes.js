const express = require('express');
const fs = require('fs');
let app = express();
//sirve para establecer un path absoluto
//IMPRESCINDIBLE PARA res.sendFile
const path = require('path');

const { verificaTokenImg } = require('../middlewares/autenticacion');

app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {

    let tipo = req.params.tipo;
    let img = req.params.img;


    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen)
    } else {
        let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg');
        //sirve para mandar la imagen(con ruta absoluta al cliente)
        res.sendFile(noImagePath);
    }
});

module.exports = app;