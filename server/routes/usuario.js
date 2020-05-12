const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const Usuario = require('../models/usuarios');
//undescore se usa así, x conveniencia
const _ = require('underscore');
//aplicamos destructuración
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');


//===========conexión mongoose con la bbdd==============
//el callback, devuelve: 
//                     err->no hay conexion
//                     res-> si lo consigue hacer
/* mongoose.connect('mongodb://localhost:20717/cafe', (err, res) => {

    // if (err) throw err;
    //en caso de conexion exitosa
    console.log('base de datos ONLINE');
}); */

//en postman hay que poner->localhost:3000/usuario
//y se genera una petición get q podemos leer
//verificaToken, es un middleware
app.get('/usuario', verificaToken, function(req, res) {

    //devolvemos todo lo q nos llega del usuario en el PAYLOAD.
    //una vez q pasa x el middleware verificaToken
    return res.json({
        usuario: req.usuario,
        nombre: req.usuario.nombre,
        email: req.usuario.email

    })

    //si nos llega una selección en la solicitud cliente:
    //            {{url}}/usuario?desde=10
    //SINO desde 0

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    //funcion de mongoose:
    //      find({})->buscar. se le puede meter filtros
    //      find({}, 'paramFilter1, paramFilter2.....')
    //      exec((err, usuarios ))-> devuelven un callback con los datos o error.

    Usuario.find({ estado: true }, 'nombre email role estado google img')
        //next desde tuplas
        .skip(desde)
        //limite d 5 tupla
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                //si hay error, mandando al usuario un "bad request"
                return res.status(400).json({
                    ok: false,
                    //err: err
                    err
                });
            }
            //si se pone condición en Usuario.find({google:true})
            //tb hay que ponerlo en count->Usuario.count({google: true})
            //ACTUALIZACION DEL MENDA!!! Usuario.count->"deprecate">Usuario.countDocuments
            //sino hay condición es llaves vacias
            Usuario.countDocuments({ estado: true }, (err, conteo) => {

                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });
            })


        })
});

//app.post()->Se utiliza para crear nuevos registros.
app.post('/usuario', [verificaToken, verificaAdmin_Role], function(req, res) {
    //cambiamos res.send()>res.json()
    let body = req.body;
    //creamos una instancia de usuario con todos las propiedades
    //y métodos q trae mongoose. Recogemos del body los datos que nos envia
    //un usuario en un html q se conecta al server

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        //guardamos encriptado el password con hash de 10 vueltas
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });
    //save es un método de mongoose para guardar en mongo
    usuario.save((err, usuarioDB) => {
        if (err) {

            //si hay error, mandando al usuario un "bad request"
            return res.status(400).json({
                ok: false,
                //err: err
                err
            });
        }
        // cuando enviamos los datos de vuelta despues de la validación
        // no se va a recibir el password.
        //usuarioDB.password = null;

        //si la cosa va bien
        res.json({
            ok: true,
            usuario: usuarioDB
        });


    });
});
//app.put()->Se utiliza para actualizar registros.
//en este caso, se pasan los datos x url
app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {
    //recogemos en la "id" que nos pide el cliente
    //lo pasamos al "body de la pagina web y mandamos el resultado"
    let id = req.params.id;
    //pick, es un método  "Underscore" q sirve para filtrar
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role',
        'estado'
    ]);

    //Buscamos el usuario y actualizamos en la Base de Datos
    //{new: true, runValidators: true}->objeto: sirve para actualizar los cambios q se producen en la bbdd al usuario
    //q hace la petición. en caso contrario, el usurio NO VERÁ los cambios.
    //la parte de runValidators:true->impide que el usuario se salte las validaciones del SQUEMA.

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //cambiamos res.send()>res.json()
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

//se utilizar para el borrado. registro pasado x param.
app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id;
    //cambiando el campo estado a "false", se entiende que 
    //el registro esta "marcado como borrado"
    let cambiaEstado = {
        estado: false
    };

    //eliminamos físicamente el registro.
    // Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {
        //************Si se produce un error *******/
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //***************Si no se encuentra el usuario ******/
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    mensaje: 'usuario no encontrado'
                }
            });

        }
        //****************Si se borrar **********/
        res.json({
            ok: true,
            usuario: usuarioBorrado
        })
    })
});


module.exports = app;