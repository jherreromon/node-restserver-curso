const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

//tanto los paquetes fs, como path, existen en node 
//no hay q cargar ninguna librería adicional

const fs = require('fs');
const path = require('path');


// aplicación de opciones por defecto . use ( fileUpload ( ) ) ;
app.use(fileUpload());

//se van a cargar los archivos en files
app.put('/upload/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    //recogemos el archivo enviado desde cliente en req.files
    //si no hay archivo mandamos un mensaje de vuelta
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se ha seleccionado ningún archivo'
                }

            })
    }

    //validar tipos
    let tiposValidos = ['productos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'los tipos permitos  son: ' + tiposValidos.join(', ')

            }
        })


    }


    //Llegamos al punto de cargar el archivo
    // El nombre del campo de entrada (es decir, "archivo") se utiliza para recuperar el archivo cargado 
    let archivo = req.files.archivo;
    //la propiedad name, la separamos x el punto para crear
    //un array de dos elementos ([nombrefic, ext])
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];


    //extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    //buscamos con indexOf la extension dentro del array de permitidas
    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'las extensiones permitidas son: ' + extensionesValidas.join(', '),
                ext: 'la extension recibida es: ' + extension
            }
        })
    }

    //cambiar el nombre al archivo:
    //vamos a guardar el archivo con un nombre compuesto x:
    //              -el id de usuario+
    //              -obtiene los milisegundos q tarda en subir la imagen
    //              -la extension si es valida

    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    //******************** */ Se usa el método "archivo.mv" para guardar el archivo en la carpeta de marras**********************

    archivo.mv(`./uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            })

        //Tratamos la imagen cargada
        //id-> verificaToken nos testea el ID.
        //res-> respuesta a pasar al usuario  web cliente
        //nombreArchivo-> q vamos a guardar y que hemos generado
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }

    });
});

//**************************************GESTIONAR IMAGEN USUARIO*********************************************/

//funcion para tratar la imagen del usuario y meterla en la BBDD
//Hay que pasar 'res' como parametro. Los parametros en javascript, se pasan
//COMO PARAMETRO POR REFERENCIA

function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {
        //sino podemos acceder x un error a la bbdd, 
        //hay que borrar la imagen del archivo q acabamos de subir desde cliente

        if (err) {
            borrarArchivo(nombreArchivo, 'usuarios');

            return res.status(500).json({
                ok: false,
                err

            });
        }
        if (!usuarioDB) {
            //si el usuario NO existe, tb lo borramos d la carpeta usuario
            //para q no se llene el servidor de basura.
            borrarArchivo(nombreArchivo, 'usuarios');

            return res.status(400).json({
                ok: false,
                err: {
                    message: "el usuario no existe en ddbb"
                }
            })
        }

        //buscamos en la ruta, la imagen q tenemos en la bbdd y q puede estar guardada en la carpeta del
        //servidor. En este caso, carpeta /usuarios
        borraArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioGuardado) => {

            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })

        });

    })


}
//*************************GESTIONAR LA IMAGEN DE PRODUCTO******************************

function imagenProducto(id, res, nombreArchivo) {

    Producto.findById(id, (err, productoDB) => {
        //sino podemos acceder x un error a la bbdd, 
        //hay que borrar la imagen del archivo q acabamos de subir desde cliente

        if (err) {
            borrarArchivo(nombreArchivo, 'productos');

            return res.status(500).json({
                ok: false,
                err

            });
        }
        if (!productoDB) {
            //si el usuario NO existe, tb lo borramos d la carpeta usuario
            //para q no se llene el servidor de basura.
            borraArchivo(nombreArchivo, 'productos');

            return res.status(400).json({
                ok: false,
                err: {
                    message: "el producto no existe en ddbb"
                }
            })
        }

        //buscamos en la ruta, la imagen q tenemos en la bbdd y q puede estar guardada en la carpeta del
        //servidor. En este caso, carpeta /productos
        borraArchivo(productoDB.img, 'productos');

        //Asignamos la imagen al campo de bbdd
        productoDB.img = nombreArchivo;

        productoDB.save((err, productoGuardado) => {

            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            })

        });

    })


}

//pasamos como parámetro:
//nombreImagen-> el nombre de la imagen a borrar
//tipo-> la carpeta dnd se encuentra dicha imagen

function borraArchivo(nombreImagen, tipo) {

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);

    //una vez q se realiza la búsqueda, comprobamos si hemos hayado la imagen
    //y procedemos a borrarla con fs.unlinkSync(pathImagen)

    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }

}

//OJO PARA TODO EXPRESS!!!: Si queremos usar esta configuración fuera de este archivo
//DEBEMOS DE PONER


module.exports = app;