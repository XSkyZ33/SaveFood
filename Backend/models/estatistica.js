const mongoose = require('mongoose')

const estatisticaSchema = new mongoose.Schema({
    tipo_estatistica: {
        type: String,
        enum: ['diaria', 'mensal', 'anual', 'semanal', 'prato'],
        required: true
    },
    observacao: {
        type: String,
        required: true
    },
    data_criacao: {
        type: Date,
        default: Date.now
    },
    dados: {
        type: Array,
        required: true
    },
})

module.exports = mongoose.model('Estatistica', estatisticaSchema, 'Estatistica')