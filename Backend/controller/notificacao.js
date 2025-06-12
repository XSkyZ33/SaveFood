const Notificacao = require('../models/notificacao');

const getNotificacoes = async (req, res) => {
    try {
        const notificacoes = await Notificacao.find({ user: req.id }).sort({ createdAt: -1 });
        res.status(200).json(notificacoes);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar notificações', error });
    }
}

const createNotificacao = async (req, res) => {
    const { mensagem, estado } = req.body;
    try {
        const notificacao = new Notificacao({
            user: req.id,
            mensagem,
            estado
        });
        await notificacao.save();
        res.status(201).json({ message: 'Notificação criada com sucesso', notificacao });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar notificação', error });
    }
}

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
}

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
}

getAllNotificacoes = async (req, res) => {
    try {
        const notificacoes = await Notificacao.find().sort({ createdAt: -1 });
        res.status(200).json(notificacoes);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar todas as notificações', error });
    }
}

getNotificacaoById = async (req, res) => {
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
}

exports.getNotificacoes = getNotificacoes;
exports.createNotificacao = createNotificacao;
exports.updateNotificacao = updateNotificacao;
exports.deleteNotificacao = deleteNotificacao;
exports.getAllNotificacoes = getAllNotificacoes;
exports.getNotificacaoById = getNotificacaoById;
