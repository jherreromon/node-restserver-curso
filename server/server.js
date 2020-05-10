require('./config/config');
const express = require('express');
const mongoose = require('mongoose');

const bodyParser = require('body-parser');

const app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//recoge las rutas del usuario
app.use(require('./routes/usuario'));

//conexion con la base de datos express-> no tira
/* const run = async() => {
    await mongoose.connect('mongodb://localhost:2017/cafe', {
        // autoReconnect: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
}; */
/* run().then(console.log('conexión establecida'));
run().catch(error => console.error(error)); */
mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true },
    (err, res) => {
        if (err) throw err;
        console.log('Base de datos ONLINE!!!');
    });
app.listen(process.env.PORT, () => {
    console.log('escuchando puerto', process.env.PORT);
})