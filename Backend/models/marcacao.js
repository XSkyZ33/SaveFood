const mongoose = require('mongoose');

const marcacaoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    data_marcacao: {
        type: Date,
        default: Date.now
    },
    horario: {
        type: String,
        enum: ['Almoco', 'Jantar'],
        required: true
    },
    prato:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TipoPrato',
        required: true
    },
    estado: {
        type: String,
        enum: ['pedido', 'servido', 'cacelado', 'nao servido'],
        default: 'confirmada'
    },
});