const Recompensa = require('../models/recompensa');
const Utilizadpor = require('../models/utilizador');

const getRecompensas = async (req, res) => {
    try {
        const recompensas = await Recompensa.find().sort({ createdAt: -1 });
        res.status(200).json(recompensas);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar recompensas', error });
    }
}

const createRecompensa = async (req, res) => {
    const { objetivo, descricao, tipo_recompensa } = req.body;
    try {
        const recompensa = new Recompensa({
            objetivo,
            descricao,
            tipo_recompensa
        });
        await recompensa.save();
        res.status(201).json({ message: 'Recompensa criada com sucesso', recompensa });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar recompensa', error });
    }
}

exports.getRecompensas = getRecompensas;
exports.createRecompensa = createRecompensa;