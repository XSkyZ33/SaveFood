const mongoose = require('mongoose');

const marcacaoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users', // refere-se ao modelo real do utilizador
        required: true
    },
    data_pedido: {
        type: Date,
        default: Date.now // quando o utilizador fez o pedido
    },
    data_marcacao: {
        type: Date, // data para a qual ele marcou
        required: true
    },
    horario: {
        type: String,
        enum: ['Almoco', 'Jantar'],
        required: true
    },
    prato: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pratos', // refere-se ao modelo real do prato
        required: true
    },
    estado: {
        type: String,
        enum: ['pedido', 'servido', 'cancelado', 'nao servido'],
        default: 'pedido'
    }
});

module.exports = mongoose.model('Marcacao', marcacaoSchema, 'Marcacoes');