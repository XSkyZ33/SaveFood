const mongoose = require('mongoose');

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
        type: String,  // Corrigi "string" para "String"
        enum: ['lida', 'nao lida'],
        default: 'nao lida'
    },
    data_envio: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notificacao', notificacaoSchema, 'Notificacao');
