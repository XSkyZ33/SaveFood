const Notificacao = require('../models/notificacao');
const User = require('../models/users'); // Importa o modelo de usuário, se necessário

// Notificações do usuário logado
const getNotificacoes = async (req, res) => {
    try {
        const notificacoes = await Notificacao.find({ userId: req.user.id }).sort({ data_envio: -1 });
        res.status(200).json(notificacoes);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar notificações', error });
    }
};

// Todas as notificações - só admin
const getAllNotificacoes = async (req, res) => {
    try {
        const notificacoes = await Notificacao.find().sort({ data_envio: -1 });
        res.status(200).json(notificacoes);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar todas as notificações', error });
    }
};

const getNotificacaoById = async (req, res) => {
    const id = req.params.id;
    try {
        const notificacao = await Notificacao.findById(id);
        if (!notificacao) {
            return res.status(404).json({ message: 'Notificação não encontrada' });
        }
        res.status(200).json(notificacao);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar notificação', error });
    }
};


const createNotificacao = async (req, res) => {
    const { userId, mensagem, estado } = req.body;

    if (!userId || !mensagem) {
        return res.status(400).json({ message: 'userId e mensagem são obrigatórios' });
    }

    try {
        // Verifica se o utilizador existe
        const utilizador = await User.findById(userId);
        if (!utilizador) {
            return res.status(404).json({ message: 'Utilizador não encontrado' });
        }

        const notificacao = new Notificacao({
            userId,
            mensagem,
            estado
        });

        await notificacao.save();
        res.status(201).json({ message: 'Notificação criada com sucesso', notificacao });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar notificação', error });
    }
};

const updateNotificacao = async (req, res) => {
    const id = req.params.id;
    const { mensagem, estado } = req.body;
    try {
        const notificacao = await Notificacao.findByIdAndUpdate(id, {
            mensagem,
            estado
        }, { new: true });
        if (!notificacao) {
            return res.status(404).json({ message: 'Notificação não encontrada' });
        }
        res.status(200).json({ message: 'Notificação atualizada com sucesso', notificacao });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar notificação', error });
    }
};

const deleteNotificacao = async (req, res) => {
    const id = req.params.id;
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

exports.getNotificacoes = getNotificacoes;
exports.createNotificacao = createNotificacao;
exports.updateNotificacao = updateNotificacao;
exports.deleteNotificacao = deleteNotificacao;
exports.getAllNotificacoes = getAllNotificacoes;
exports.getNotificacaoById = getNotificacaoById;
