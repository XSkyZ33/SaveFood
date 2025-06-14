const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: null
    },
    type_user: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    pontos_recompensas: {
        type: Number,
        default: 0
    },
    pontos_bom_comportamento: {
        type: Number,
        default: 10
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    recompensas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recompensas'
    }],
    notificacoes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notificacao'
    }],
    marcacoes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Marcacao'
    }],
})

module.exports = mongoose.model('Users', userSchema, 'Users')