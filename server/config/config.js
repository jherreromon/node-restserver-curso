//=========================
//Puerto
//=========================

//esta variable la maneja heroku.
//sino existe es q el puerto es 3000 (local no heroku)
process.env.PORT = process.env.PORT || 3000;


//=========================
// Entorno
//=========================
//esta variable, pertenece a heroku y se puede utilizar en node.
//si la variable NO existe, es q estoy en desarrollo (variable 'dev')
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//=========================
//vencimiento del token
//=========================
//60 segundos
//60 minutos
//24 horas
//30 días

process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

//=========================
//SEED de autentificacion
//=========================

process.env.SEED = process.env.SEED || 'este es el seed de desarrollo';


//=========================
//Base de Datos
//=========================

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    //cadena de bbdd en local
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    //cadena para conexion con mongodb atlas
    // urlDB = 'mongodb+srv://juan:88888888@cluster0-icgb5.mongodb.net/cafe';
    urlDB = process.env.MONGO_URI;
}
//esta variable, nos la inventamos para asignar urlDB;
process.env.URLDB = urlDB;