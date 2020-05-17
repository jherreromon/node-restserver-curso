const express = require('express');

let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');
let app = express();

let Categoria = require('../models/categoria');
//let Usuario = require('../models/usuario');



//generamos 5 servicios

//============================
//Mostrar todas las categorias
// aunq lo ponemos, verificaToken no se tiene en cuenta
// ya q el usuario ha sido validado antes y aquí, creo q no pinta nada
//============================

app.get('/categoria', verificaToken, (req, res) => {


    Categoria.find({})
        //sirve para relacionar las tablas
        .sort('descripcion')
        .populate("usuario", 'nombre email')
        .exec((err, categorias) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            //si se encuentran las categorias
            res.json({
                ok: true,
                categorias
            })

        })

});

//============================
//Mostrar una categoría por ID
//============================

app.get('/categoria/:id', verificaToken, (req, res) => {
    //Categoria.findById(...)

    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //si no se encuentra la categoría en la bbdd
        if (!categoriaDB) {
            return res.sendStatus(401).json({
                ok: false,
                err: {
                    message: 'el ID no es correcto'
                }
            })
        }
        //si se encuentran las categorias
        res.json({
            ok: true,
            categoria: categoriaDB
        })

    })


});

//====================================
//Crear (postear) una nueva categoría
//====================================
app.post('/categoria', verificaToken, (req, res) => {
    // regresa la nueva categoría. en el toquen generado con 
    //jwt, viene id del usuario de la 
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id //ojo va en el token. Por esto tenemos que pasarlo con verificaToken
    });

    //Procedemos a guardar la categoría
    categoria.save((err, categoriaDB) => {


        //error (500) de base de datos serio
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //error al guardar la categoria,
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }


        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });



});

//====================================
//Actualizar una categoría (putear)
//====================================

app.put('/categoria/:id', (req, res) => {

    //en postman, hay q poner el id en la sección 
    //de parámetros o en la url
    let id = req.params.id;
    let body = req.body;

    let descategoria = {
        descripcion: body.descripcion
    }

    Categoria.findByIdAndUpdate(id, descategoria, { new: true, runValidators: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //error al guardar la categoria,
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });

});

//====================================
//Eliminar una categoría
//====================================

app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    //Solo un administrador puede eliminar la categoria
    //categoria.findByIdAndRemove
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //error al Bobrrar la categoria,
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'el id no existe y por lo tatno no se puede borrar'
                }

            });

        }
        res.json({
            ok: true,
            message: 'categoria borrada'
        });

    });

});

module.exports = app;