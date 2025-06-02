const mongoose = require('mongoose')

const notificacaoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mensagem: {
        type: String,
        required: true
    },
    estado: {
        type: string,
        enum: ['lida', 'nao lida', 'apagada'],
        default: 'nao lida'
    },
    data_envio: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Notificacao', notificacaoSchema)