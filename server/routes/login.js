const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

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


    });


});
//configuraciones de Google: al tener un async, regresa una promesa
//este función se llama desde app.post('/google', ....)

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();


    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }


}
//verify().catch(console.error);



//validación de google: recibimos desde cliente (pagina html), el token de google.
app.post('/google', async(req, res) => {

    let token = req.body.idtoken;

    //Podría ocurrir (improbable q el token fuera incorrecto o hubiera caducado)
    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e

            });
        });

    //una vez q hemos validado el usuario con los datos de google,
    //pasamos a trabajar con nuestra bbdd para registrar el usuario

    //findOne->Me interesa regresar solo un usuario de la bbdd (en est caso con la dirección email que viene en el body de solicitud de validación)
    //el callback regresa el usuario o un error 500(internal server error)
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            //si hay error, mandando al usuario un "bad request"
            return res.status(500).json({
                ok: false,
                //err: err
                err
            })
        };

        if (usuarioDB) {
            //si el usuario ya se habia validado anteriormente en BBDD sin google
            if (usuarioDB.google === false) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'debe de autentificarse como usuario normal'
                    }

                });
            } else {
                //si el usuario ya se había validado con google, hay que RENOVAR EL TOKEN Y
                //reeplazar por nuestro token personalizado Y enviarlo al navegador del cliente
                let token = jwt.sign({
                    usuario: usuarioDB //expira en 60seg x 60 min * 24 Horas * 30 días   
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                });

            }

        } else {
            //si una vez validado en google, el usuario no está en nuestra BBDD
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';
            //Guardamos los datos en la bbdd

            usuario.save((err, usuarioDB) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                };

                let token = jwt.sign({
                    usuario: usuarioDB //expira en 60seg x 60 min * 24 Horas * 30 días   
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                //devolvemos una vez guardamos, los datos al usuario cliente
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                });

            });

        }

    });
});
module.exports = app;