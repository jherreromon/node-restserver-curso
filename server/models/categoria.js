const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let categoriaSchema = new Schema({
    descripcion: {
        type: String,
        unique: true,
        required: [true, 'La descripción es obligatoria']
    },
    usuario: {
        type: Schema.Types.ObjectId,
        //este es el esquema al que hace referencia
        //sirve para hacer relaciones
        ref: 'Usuario'
    }
});

module.exports = mongoose.model('Categoria', categoriaSchema)