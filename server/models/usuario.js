//93: "Modelo de usuario"->en este fichero, vamos a diseñar el modelo de usuario
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

//validación de campos
let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'

};
//el "esquema", se podría asimilar a las tablas en un modelo relacional
let Schema = mongoose.Schema;

let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'el nombre es necesario'],
        unique: false
    },
    email: {
        type: String,
        required: [true, 'el correo es necesario'],
        unique: true

    },
    password: {
        type: String,
        required: [true, 'la contraseña es obligatoria']
    },
    img: {
        type: String,
        required: false
    }, //no es obligatoria
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos

    }, //default: 'USER_ROLE'
    estado: {
        type: Boolean,
        default: true
    }, //Boolean
    google: {
        type: Boolean,
        default: false
    } //Boolean
});

//para evitar q se devuelva el password al body del cliente
//recogemos el JSON y lo modificamos. con función flecha, no funciona.

usuarioSchema.methods.toJSON = function() {
        //recogemos la instacia (objeto this)
        let user = this;
        let userObject = user.toObject();
        delete userObject.password;

        return userObject;
    }
    //para poder utilizar mongoose-unique-validator: en path se inyecta el campo q emite error
usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });
//exportamos una instancia de usuarioSchema->usuario
module.exports = mongoose.model('Usuario', usuarioSchema)