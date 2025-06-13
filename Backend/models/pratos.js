// To be completed bacause its something that i added to the project right now
// Still need to make sure it makes sense to add this

const mongoose = require('mongoose');

const pratoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },
    imagem: {
        type: String,
        default: null
    },
    tipo_prato: {
        type: String,
        enum: ['Dieta', 'Carne', 'Peixe', 'Vegetariano', 'Outro'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Pratos', pratoSchema, 'Pratos');