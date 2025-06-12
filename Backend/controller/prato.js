const prato = require('../models/pratos');

const getPratos = async (req, res) => {
    try {
        const pratos = await prato.find().sort({ nome: 1 });
        res.status(200).json(pratos);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar pratos', error });
    }
}

const getPratoById = async (req, res) => {
    const id = req.params.id;
    try {
        const pratoItem = await prato.find
        ById(id);
        if (!pratoItem) {
            return res.status(404).json({ message: 'Prato não encontrado' });
        }
        res.status(200).json(pratoItem);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar prato', error });
    }
}

const createPrato = async (req, res) => {
    const { nome, descricao, tipo_prato } = req.body;
    try {
        const newPrato = new prato({
            nome,
            descricao,
            tipo_prato,
            imagem: req.file ? req.file.path : null
        });
        await newPrato.save();
        res.status(201).json({ message: 'Prato criado com sucesso', prato: newPrato });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar prato', error });
    }
}

const updatePrato = async (req, res) => {
    const id = req.params.id;
    const { nome, descricao, tipo_prato } = req.body;
    try {
        const pratoItem = await prato.findById(id);
        if (!pratoItem) {
            return res.status(404).json({ message: 'Prato não encontrado' });
        }
        if (nome) pratoItem.nome = nome;
        if (descricao) pratoItem.descricao = descricao;
        if (tipo_prato) pratoItem.tipo_prato = tipo_prato;
        if (req.file) {
            pratoItem.imagem = req.file.path;
        }
        await pratoItem.save();
        res.status(200).json({ message: 'Prato atualizado com sucesso', prato: pratoItem });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar prato', error });
    }
}

const deletePrato = async (req, res) => {
    const id = req.params.id;
    try {
        const pratoItem = await prato.findByIdAndDelete(id);
        if (!pratoItem) {
            return res.status(404).json({ message: 'Prato não encontrado' });
        }
        res.status(200).json({ message: 'Prato deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar prato', error });
    }
}

const getPratosByTipo = async (req, res) => {
    const tipo = req.params.tipo;
    try {
        const pratos = await prato.find({ tipo_prato: tipo }).sort({ nome: 1 });
        if (pratos.length === 0) {
            return res.status(404).json({ message: 'Nenhum prato encontrado para este tipo' });
        }
        res.status(200).json(pratos);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar pratos por tipo', error });
    }
}

exports.getPratos = getPratos;
exports.getPratoById = getPratoById;
exports.createPrato = createPrato;
exports.updatePrato = updatePrato;
exports.deletePrato = deletePrato;
exports.getPratosByTipo = getPratosByTipo;