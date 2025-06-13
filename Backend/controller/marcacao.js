const Marcacao = require('../models/marcacao');

// ajusta o caminho se for diferente
const Pratos = require('../models/pratos');      // importa o model Pratos

const createMarcacao = async (req, res) => {
  console.log('createMarcacao called with body:', req.body);
  console.log('User ID:', req.user.id);

  try {
    const { data_marcacao, horario, prato } = req.body;

    // Verifica se o prato existe
    const pratoEncontrado = await Pratos.findById(prato);
    if (!pratoEncontrado) {
      return res.status(404).json({ message: 'Prato não encontrado. Não foi possível criar a marcação.' });
    }

    const novaMarcacao = new Marcacao({
      userId: req.user.id,
      data_marcacao,
      horario,
      prato,
    });

    await novaMarcacao.save();

    res.status(201).json({ message: 'Marcação criada com sucesso', marcacao: novaMarcacao });
  } catch (error) {
    console.error('Erro ao criar marcação:', error);
    res.status(500).json({ message: 'Erro ao criar marcação', error });
  }
};

const getMarcacoes = async (req, res) => {
    try {
        const marcacoes = await Marcacao.find()
            .populate('userId', '-password')
            .populate('prato');
        res.status(200).json(marcacoes);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao obter marcações', error });
    }
};

const getMarcacoesByUser = async (req, res) => {
    const userId = req.user.id; // pega o id do token

    try {
        const marcacoes = await Marcacao.find({ userId })
            .populate('prato');
        res.status(200).json(marcacoes);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao obter marcações do utilizador', error });
    }
};

const getMarcacoesByDate = async (req, res) => {
    const { date } = req.params;
    try {
        const marcacoes = await Marcacao.find({ data_marcacao: new Date(date) })
            .populate('userId', '-password')
            .populate('prato');
        if (marcacoes.length === 0) {
            return res.status(404).json({ message: 'Nenhuma marcação encontrada para esta data' });
        }
        res.status(200).json(marcacoes);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao obter marcações por data', error });
    }
}

const updateEstadoMarcacao = async (req, res) => {
    const id = req.params.id;
    const { estado } = req.body;

    try {
        const marcacao = await Marcacao.findByIdAndUpdate(id, { estado }, { new: true });
        if (!marcacao) {
            return res.status(404).json({ message: 'Marcação não encontrada' });
        }
        res.status(200).json({ message: 'Estado atualizado', marcacao });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar marcação', error });
    }
};

const deleteMarcacao = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await Marcacao.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ message: 'Marcação não encontrada' });
        }
        res.status(200).json({ message: 'Marcação eliminada com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao eliminar marcação', error });
    }
};

const getMarcacaoById = async (req, res) => {
    const id = req.params.id;
    try {
        const marcacao = await Marcacao.findById(id)
            .populate('userId', '-password')
            .populate('prato');
        if (!marcacao) {
            return res.status(404).json({ message: 'Marcação não encontrada' });
        }
        res.status(200).json(marcacao);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao obter marcação', error });
    }
};

exports.createMarcacao = createMarcacao;
exports.getMarcacoes = getMarcacoes;
exports.getMarcacoesByUser = getMarcacoesByUser;
exports.getMarcacoesByDate = getMarcacoesByDate;
exports.updateEstadoMarcacao = updateEstadoMarcacao;
exports.deleteMarcacao = deleteMarcacao;
exports.getMarcacaoById = getMarcacaoById;
