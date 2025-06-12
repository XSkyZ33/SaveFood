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
    data: {
        type: Date,
        default: Date.now
    },
    dados: {
        type: Object,
        required: true
    },
})

module.exports = mongoose.model('Estatistica', estatisticaSchema, 'Estatistica')