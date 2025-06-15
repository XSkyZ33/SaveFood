const Notificacao = require('../models/notificacao');
const User = require('../models/users');
const mongoose = require('mongoose');

// Notificações do usuário logado
const getNotificacoes = async (req, res) => {
    try {
        const notificacoes = await Notificacao.find({ userId: req.user.id }).sort({ data_envio: -1 });
        res.status(200).json(notificacoes);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar notificações do utilizador', error });
    }
};

// Todas as notificações - apenas para admin
const getAllNotificacoes = async (req, res) => {
    try {
        const notificacoes = await Notificacao.find().sort({ data_envio: -1 });
        res.status(200).json(notificacoes);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar todas as notificações', error });
    }
};

// Criar nova notificação
const createNotificacao = async (req, res) => {
    const { userId, mensagem, estado } = req.body;

    try {
        const utilizador = await User.findById(userId);
        if (!utilizador) {
            return res.status(404).json({ message: 'Utilizador não encontrado' });
        }

        const notificacao = new Notificacao({
            userId,
            mensagem,
            estado: estado || 'nao lida',
        });

        await notificacao.save();

        // Adiciona a notificação ao utilizador
        utilizador.notificacoes = utilizador.notificacoes || [];
        utilizador.notificacoes.push(notificacao._id);
        await utilizador.save();

        res.status(201).json({ message: 'Notificação criada com sucesso', notificacao });

    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar notificação', error });
    }
};


// Atualizar notificação
const updateNotificacao = async (req, res) => {
    const { id } = req.params;
    const { mensagem, estado } = req.body;

    try {
        const notificacao = await Notificacao.findByIdAndUpdate(
            id,
            { mensagem, estado },
            { new: true }
        );

        if (!notificacao) {
            return res.status(404).json({ message: 'Notificação não encontrada' });
        }

        res.status(200).json({ message: 'Notificação atualizada com sucesso', notificacao });

    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar notificação', error });
    }
};

// Deletar notificação
const deleteNotificacao = async (req, res) => {
    const { id } = req.params;

    try {
        const notificacao = await Notificacao.findByIdAndDelete(id);

        if (!notificacao) {
            return res.status(404).json({ message: 'Notificação não encontrada' });
        }

        res.status(200).json({ message: 'Notificação deletada com sucesso' });

    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar notificação', error });
    }
};

// Buscar notificação por ID
const getNotificacaoById = async (req, res) => {
    const { id } = req.params;

    // Verifica se o ID é um ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        const notificacao = await Notificacao.findById(id);

        if (!notificacao) {
            return res.status(404).json({ message: 'Notificação não encontrada' });
        }

        res.status(200).json(notificacao);

    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar notificação por ID', error });
    }
};

exports.getNotificacoes = getNotificacoes;
exports.getAllNotificacoes = getAllNotificacoes;
exports.createNotificacao = createNotificacao;
exports.updateNotificacao = updateNotificacao;
exports.deleteNotificacao = deleteNotificacao;
exports.getNotificacaoById = getNotificacaoById;

