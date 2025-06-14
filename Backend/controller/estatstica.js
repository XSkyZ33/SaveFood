const Estatistica = require('../models/estatistica');

const getEstatisticas = async (req, res) => {
    try {
        const { tipo } = req.query;

        const filtro = tipo ? { tipo_estatistica: tipo } : {};
        const estatisticas = await Estatistica.find(filtro).sort({ data: -1 });

        if (estatisticas.length === 0) {
            return res.status(404).json({ message: 'Nenhuma estatística encontrada' });
        }

        res.status(200).json(estatisticas);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar estatísticas', error });
    }
};

const getEstatisticasById = async (req, res) => {
    const id = req.params.id;
    try {
        const estatistica = await Estatistica.findById(id);
        if (!estatistica) {
            return res.status(404).json({ message: 'Estatística não encontrada' });
        }
        res.status(200).json(estatistica);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar estatística', error });
    }
}


const createEstatistica = async (req, res) => {
    const { tipo_estatistica, observacao, dados } = req.body;
    try {
        const estatistica = new Estatistica({
            tipo_estatistica,
            observacao,
            dados
        });
        await estatistica.save();
        res.status(201).json({ message: 'Estatística criada com sucesso', estatistica });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar estatística', error });
    }
}

const updateEstatistica = async (req, res) => {
    const id = req.params.id;
    const { tipo_estatistica, observacao, dados } = req.body;
    try {
        const estatistica = await Estatistica.findByIdAndUpdate(id, {
            tipo_estatistica,
            observacao,
            dados
        }, { new: true });
        if (!estatistica) {
            return res.status(404).json({ message: 'Estatística não encontrada' });
        }
        res.status(200).json({ message: 'Estatística atualizada com sucesso', estatistica });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar estatística', error });
    }
}

exports.getEstatisticas = getEstatisticas;
exports.createEstatistica = createEstatistica;
exports.updateEstatistica = updateEstatistica;
exports.getEstatisticasById = getEstatisticasById;
