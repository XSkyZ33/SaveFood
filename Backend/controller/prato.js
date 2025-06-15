const prato = require('../models/pratos');
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

// Buscar todos os pratos
const getPratos = async (req, res) => {
    try {
        const filtro = {};
        if (req.query.tipo) {
            filtro.tipo_prato = req.query.tipo;
        }
        const pratos = await prato.find(filtro).sort({ nome: 1 });
        res.status(200).json(pratos);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar pratos', error });
    }
};

// Buscar prato por ID
const getPratoById = async (req, res) => {
    try {
        const pratoItem = await prato.findById(req.params.id);
        if (!pratoItem) {
            return res.status(404).json({ message: 'Prato não encontrado' });
        }
        res.status(200).json(pratoItem);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar prato', error });
    }
};

// Criar novo prato
const createPrato = async (req, res) => {
    try {
        const { nome, descricao, tipo_prato } = req.body;
        let imagem = null;

        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;
            imagem = await cloudinary.uploader.upload(dataURI, { resource_type: "image" });
        }

        const novoPrato = new prato({
            nome,
            descricao,
            tipo_prato,
            imagem: imagem?.secure_url || null,
            cloudinary_id: imagem?.public_id || null
        });

        await novoPrato.save();
        res.status(201).json({ message: 'Prato criado com sucesso', prato: novoPrato });

    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar prato', error });
    }
};

// Atualizar prato
const updatePrato = async (req, res) => {
    const { id } = req.params;
    const { nome, descricao, tipo_prato } = req.body;

    try {
        const pratoItem = await prato.findById(id);
        if (!pratoItem) return res.status(404).json({ message: 'Prato não encontrado' });

        // Atualização de imagem (se houver nova)
        if (req.file) {
            if (pratoItem.cloudinary_id) {
                await cloudinary.uploader.destroy(pratoItem.cloudinary_id);
            }

            const b64 = Buffer.from(req.file.buffer).toString("base64");
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;
            const imagemUpload = await cloudinary.uploader.upload(dataURI, { resource_type: "image" });

            pratoItem.imagem = imagemUpload.secure_url;
            pratoItem.cloudinary_id = imagemUpload.public_id;
        }

        if (nome) pratoItem.nome = nome;
        if (descricao) pratoItem.descricao = descricao;
        if (tipo_prato) pratoItem.tipo_prato = tipo_prato;

        await pratoItem.save();
        res.status(200).json({ message: 'Prato atualizado com sucesso', prato: pratoItem });

    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar prato', error });
    }
};

// Deletar prato
const deletePrato = async (req, res) => {
    try {
        const pratoItem = await prato.findById(req.params.id);
        if (!pratoItem) return res.status(404).json({ message: 'Prato não encontrado' });

        // Deleta imagem do Cloudinary se existir
        if (pratoItem.cloudinary_id) {
            await cloudinary.uploader.destroy(pratoItem.cloudinary_id);
        }

        await pratoItem.deleteOne();
        res.status(200).json({ message: 'Prato deletado com sucesso' });

    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar prato', error });
    }
};

exports.getPratos = getPratos;
exports.getPratoById = getPratoById;
exports.createPrato = createPrato;
exports.updatePrato = updatePrato;
exports.deletePrato = deletePrato;

