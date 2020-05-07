require('./config/config');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//en postman hay que meter->localhost:3000/usuario
//y se genera una petición get q podemos leer
app.get('/usuario', function(req, res) {
    //cambiamos res.send()>res.json()
    res.json('get Usuario')
});

//app.post()->Se utiliza para crear nuevos registros.
app.post('/usuario', function(req, res) {
    //cambiamos res.send()>res.json()
    let body = req.body;
    if (body.nombre === undefined) {
        res.status(400).json({
            ok: false,
            mensaje: 'el nombre es necesario'
        });
    } else {
        //sería lo mismo poner:
        //res.json({
        //    body:body
        //})
        //OR
        //res.json(body);
        //La tercera manera:
        res.json({
            persona: body
        });
    }
    //la resupuesta en postman es:
    /* {
        "persona": {
            "nombre": "juan",
            "edad": "51"
        }
    } */
});
//app.put()->Se utiliza para actualizar registros.
//en este caso, se pasan los datos x url
app.put('/usuario/:id', function(req, res) {
    //recogemos en la "id" que nos pide el cliente
    //lo pasamos al "body de la pagina web y mandamos el resultado"
    let id = req.params.id;
    //cambiamos res.send()>res.json()
    res.json({
        id: id
    })
});

//se utilizar para "marcar" registros como borrados
app.delete('/usuario', function(req, res) {
    //cambiamos res.send()>res.json()
    res.json('delete Usuario')
});


app.listen(process.env.PORT, () => {
    console.log('escuchando puerto', process.env.PORT);
});