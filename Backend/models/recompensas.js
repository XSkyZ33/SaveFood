const mongoose = require('mongoose')

const recompensasSchema = new mongoose.Schema({
    objetivo : {
        type: Number,
        required: true
    },
    descricao : {
        type: String,
        required: true
    },
    tipo_recompensa : {
        type: String,
        enum: ['voucher', 'codigo_desconto', 'produto'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Recompensas', recompensasSchema, 'Recompensas')