const Recompensa = require('../models/recompensas');
const Utilizador = require('../models/users');

const getRecompensas = async (req, res) => {
    try {
        const filtro = {};

        if (req.query.tipo_recompensa) {
            filtro.tipo_recompensa = req.query.tipo_recompensa;
        }

        const recompensas = await Recompensa.find(filtro).sort({ createdAt: -1 });
        res.status(200).json(recompensas);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar recompensas', error });
    }
};


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

const updateRecompensa = async (req, res) => {
  const id = req.params.id;
  const { objetivo, descricao, tipo_recompensa } = req.body;

  try {
    const updateFields = {};
    if (objetivo !== undefined) updateFields.objetivo = objetivo;
    if (descricao !== undefined) updateFields.descricao = descricao;
    if (tipo_recompensa !== undefined) updateFields.tipo_recompensa = tipo_recompensa;

    const recompensa = await Recompensa.findByIdAndUpdate(id, updateFields, { new: true });

    if (!recompensa) {
      return res.status(404).json({ message: 'Recompensa não encontrada' });
    }

    res.status(200).json({ message: 'Recompensa atualizada com sucesso', recompensa });
  } catch (error) {
    console.error('Erro ao atualizar recompensa:', error);
    res.status(500).json({ message: 'Erro ao atualizar recompensa', error });
  }
}


const deleteRecompensa = async (req, res) => {
    const id = req.params.id;
    try {
        const recompensa = await Recompensa.findByIdAndDelete(id);
        if (!recompensa) {
            return res.status(404).json({ message: 'Recompensa não encontrada' });
        }
        res.status(200).json({ message: 'Recompensa deletada com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar recompensa', error });
    }
}

const getRecompensasByUtilizador = async (req, res) => {
    const utilizadorId = req.params.id;
    try {
        const utilizador = await Utilizador.findById(utilizadorId);
        if (!utilizador) {
            return res.status(404).json({ message: 'Utilizador não encontrado' });
        }
        const recompensas = await Recompensa.find({ utilizador: utilizadorId }).sort({ createdAt: -1 });
        res.status(200).json(recompensas);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar recompensas do utilizador', error });
    }
}

const getRecompensaById = async (req, res) => {
    const id = req.params.id;
    try {
        const recompensa = await Recompensa.findById(id);
        if (!recompensa) {
            return res.status(404).json({ message: 'Recompensa não encontrada' });
        }
        res.status(200).json(recompensa);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar recompensa', error });
    }
}


const resgatarRecompensa = async (req, res) => {
    const utilizadorId = req.user.id; // vem do token JWT
    const { recompensaId } = req.body;

    try {
        // Verifica se o utilizador existe
        const utilizador = await Utilizador.findById(utilizadorId);
        if (!utilizador) {
            return res.status(404).json({ message: 'Utilizador não encontrado' });
        }

        // Verifica se a recompensa existe
        const recompensa = await Recompensa.findById(recompensaId);
        if (!recompensa) {
            return res.status(404).json({ message: 'Recompensa não encontrada' });
        }

        // Verifica pontos de bom comportamento
        if (utilizador.pontos_bom_comportamento <= 0) {
            return res.status(403).json({ message: 'Não pode resgatar recompensas com 0 pontos de bom comportamento' });
        }

        // Verifica se tem pontos suficientes
        if (utilizador.pontos_recompensas < recompensa.objetivo) {
            return res.status(403).json({ message: 'Pontos de recompensa insuficientes' });
        }

        // Desconta os pontos e adiciona recompensa
        utilizador.pontos_recompensas -= recompensa.objetivo;
        utilizador.recompensas.push(recompensa._id);
        await utilizador.save();

        return res.status(200).json({
            message: 'Recompensa resgatada com sucesso',
            recompensaResgatada: recompensa,
            pontosRestantes: utilizador.pontos_recompensas
        });

    } catch (error) {
        console.error('Erro ao resgatar recompensa:', error);
        res.status(500).json({ message: 'Erro interno ao resgatar recompensa', error });
    }
};



exports.getRecompensas = getRecompensas;
exports.createRecompensa = createRecompensa;
exports.updateRecompensa = updateRecompensa;
exports.deleteRecompensa = deleteRecompensa;
exports.getRecompensasByUtilizador = getRecompensasByUtilizador;
exports.getRecompensaById = getRecompensaById;
exports.resgatarRecompensa = resgatarRecompensa;