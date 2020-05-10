//=========================
//Puerto
//=========================
process.env.PORT = process.env.PORT || 3000;


//=========================
// Entorno
//=========================
//esta variable, pertenece a heroku y se puede utilizar en node.
//si la variable NO existe, es q estoy en desarrollo (variable 'dev')
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


//=========================
//Base de Datos
//=========================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    //cadena de bbdd en local
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    //cadena para conexion con mongodb atlas
    urlDB = 'mongodb+srv://juan:88888888@cluster0-icgb5.mongodb.net/cafe';
}
//esta variable, nos la inventamos para asignar urlDB;
process.env.URLDB = urlDB;