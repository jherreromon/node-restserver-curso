const express = require('express');
const { verificaToken } = require('../middlewares/autenticacion');

//la variable de express
let app = express();
let Producto = require('../models/producto');


//===============================
// Obtener productos
//===============================

app.get('/productos', verificaToken, (req, res) => {

    //esto tiene q venir desde postman->"query Params"
    //Si no viene valor, x defecto es cero
    let desde = req.query.desde || 0;
    desde = Number(desde);

    //OJO disponible= false-> regtro borrado
    Producto.find({ disponible: true })
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => { //ejecutar el query

            //error (500) de base de datos serio
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos
            });

        })



});
//===============================
// Obtener productos por ID
//===============================


app.get('/productos/:id', (req, res) => {
    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'ID no exite'
                    }
                })
            }

            res.json({
                ok: true,
                producto: productoDB
            })
        })




});

//===============================
// Buscar Producto
//===============================

app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    //utilizamos una expresión regular:
    //usamos la función RegExp d javascript
    //y el parámetro 'i' para q sea insensible a mayusculas y minusculas
    //es decir, busca todo lo q CONTENGA la expresión guardada en termino
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                productos
            })

        })



});


//===============================
// Crear un nuevo Producto
//===============================
app.post('/productos', verificaToken, (req, res) => {
    // regresa la nueva categoría. en el toquen generado con 
    //jwt, viene id del usuario de la 
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        usuario: req.usuario._id, //ojo va en el token x eso tenemos que pasarlo con verificaToken
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria

    });

    //Procedemos a guardar el producto
    producto.save((err, productoDB) => {


        //error (500) de base de datos serio
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //error al guardar la categoria,
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }


        res.status(201).json({
            ok: true,
            producto: productoDB
        });

    });


});


//===============================
//Actualizar un Producto
//===============================
app.put('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    //con findById solo se busca el articulo. Actualizarlo 
    //lo tenemos q actualizar x código
    //findByIdAndUpdate, se actualiza automáticamente
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'hubo un error'
                }
            });
        }
        //error al guardar la categoria,
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'el id no existe en la bbdd'
                }
            })
        }
        //si es exitosa la actualización mandamos el resultado al cliente

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;

        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            res.json({

                ok: true,
                producto: productoGuardado
            })

        })


    });


});

//===============================
//borrar un Producto
//no borrar: disponible = falso
//===============================
app.delete('/productos/:id', (req, res) => {

    let id = req.params.id;

    Producto.findById(id, (err, productoDB) => {
        //error (500) de base de datos serio
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //error al guardar la categoria,
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            })
        }
        productoDB.disponible = false;

        //cuando guardamos, nos devuleve el producto que ha guardado/borrado
        productoDB.save((err, productoBorrado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }


            res.json({
                ok: true,
                producto: productoBorrado,
                mensaje: 'Producto borrado'
            })
        })


    });


})







//exportamos todas las configuraciones q hagamos al objeto
module.exports = app;