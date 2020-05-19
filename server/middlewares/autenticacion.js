const jwt = require('jsonwebtoken');
const express = require('express');
// ============================
// Verificar Token
// ============================


// si no  utilizamos el next, solo se ejecuta el header
//verifaToken, se va a usar para verificar el usuario buscado
let verificaToken = (req, res, next) => {

    //leemos el header de la solitud y cogemos  el token
    let token = req.get('token');

    //comprobamos q el token sea valido. decoded->contiene la info del usuario
    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({ // código de no autorizado
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            })

        }
        //si no hay errores, se recoge el payload.usuario
        req.usuario = decoded.usuario
            //***********una vez gestionado header 
            //***********sigue con los datos del formulario
        next();

    });



};

// ============================
// Verificar AdminRole
// ============================

//Creamos un middleware, en el validemos usuarios para
//PUT(actualizar usuario) y POST(dar de alta usuario)  y DELETE(eliminar usuarios)
let verificaAdmin_Role = (req, res, next) => {

    let usuario = req.usuario

    if (usuario.role !== 'ADMIN_ROLE') {
        return res.status(401).json({ // código de no autorizado
            ok: false,
            err: {
                message: 'No tienes privilegios para esa acción',
                usuario
            }
        })
    }

    //***********una vez gestionado header 
    //***********sigue con los datos del formulario
    next();

}




//============================
// Verifica token para imagen
//============================

let verificaTokenImg = (req, res, next) => {
    //con esta función en vez de enviar token en el "header",
    //se remite token x URL

    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decoded.usuario;
        next();

    });


}



module.exports = {

    verificaToken,
    verificaAdmin_Role,
    verificaTokenImg
}