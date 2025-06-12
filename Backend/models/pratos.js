// To be completed bacause its something that i added to the project right now
// Still need to make sure it makes sense to add this

const mongoose = require('mongoose');

const pratoSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    nome: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },
    preco: {
        type: Number,
        required: true,
        min: 0
    },
    imagem: {
        type: String,
        default: null
    },
    tipo_prato: {
        type: String,
        enum: ['entrada', 'prato_principal', 'sobremesa'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Pratos', pratoSchema, 'Pratos');