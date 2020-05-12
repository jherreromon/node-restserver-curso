const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuarios');
const app = express();



app.post('/login', (req, res) => {

    let body = req.body;

    //findOne->Me interesa regresar solo un usuario de la bbdd (en est caso con la dirección email que viene en el body de solicitud de validación)
    //el callback regresa el usuario o un error 500(internal server error)
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            //si hay error, mandando al usuario un "bad request"
            return res.status(500).json({
                ok: false,
                //err: err
                err
            });
        }
        //si el usuario no existe: email erroneo
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }

            });

        }
        //la contraseña fue encriptada en hash de una sola via con 10 vueltas
        //si son iguales, hacemos match. Si no son iguales devolvemos error
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }

            });
        }
        //jwt.sign->genera un token: usuario: usuarioDB es el payload
        //añadimos la firma generada con el SEED-> process.evn.SEED
        //se guarda en el localStorage del cliente
        let token = jwt.sign({
            usuario: usuarioDB //expira en 60seg x 60 min * 24 Horas * 30 días   
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        //si usuario y contraseña son correctos
        //devolvemos al cliente el usuario + token
        //el token, se guarda en el localStore del cliente

        res.json({
            ok: true,
            usuario: usuarioDB,
            //token: token
            token
        });


    })


})

module.exports = app;