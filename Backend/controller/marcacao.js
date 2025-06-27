const Marcacao = require('../models/marcacao');
const Pratos = require('../models/pratos');
const Users = require('../models/users');

// Criar marcação
const createMarcacao = async (req, res) => {
  try {
    const { data_marcacao, horario, prato } = req.body;

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

    // Atualiza o usuário adicionando a marcação ao array `marcacoes`
    await Users.findByIdAndUpdate(
      req.user.id,
      { $push: { marcacoes: novaMarcacao._id } },
      { new: true }
    );

    res.status(201).json({ message: 'Marcação criada com sucesso', marcacao: novaMarcacao });

  } catch (error) {
    console.error('Erro ao criar marcação:', error);
    res.status(500).json({ message: 'Erro ao criar marcação', error });
  }
};

const createMarcacaoForUser = async (req, res) => {
  const userId = req.params.userId;
  const { data_marcacao, horario, prato } = req.body;
  try {
    const pratoEncontrado = await Pratos.findById(prato);
    if (!pratoEncontrado) {
      return res.status(404).json({ message: 'Prato não encontrado. Não foi possível criar a marcação.' });
    }
    const novaMarcacao = new Marcacao({
      userId: userId,
      data_marcacao,
      horario,
      prato,
    });
    await novaMarcacao.save();
    // Atualiza o usuário adicionando a marcação ao array `marcacoes`
    await Users.findByIdAndUpdate(
      userId,
      { $push: { marcacoes: novaMarcacao._id } },
      { new: true }
    );
    res.status(201).json({ message: 'Marcação criada com sucesso', marcacao: novaMarcacao });
  } catch (error) {
    console.error('Erro ao criar marcação para utilizador:', error);
    res.status(500).json({ message: 'Erro ao criar marcação para utilizador', error });
  }
};


// Obter marcações (todas ou por data)
const getMarcacoes = async (req, res) => {
  try {
    const filtro = {};

    if (req.query.data) {
      const data = new Date(req.query.data);
      const diaSeguinte = new Date(data);
      diaSeguinte.setDate(data.getDate() + 1);

      filtro.data_marcacao = {
        $gte: data,
        $lt: diaSeguinte,
      };
    }

    const marcacoes = await Marcacao.find(filtro)
      .populate('userId', '-password')
      .populate('prato');

    if (!marcacoes.length) {
      return res.status(404).json({ message: 'Nenhuma marcação encontrada' });
    }

    res.status(200).json(marcacoes);

  } catch (error) {
    console.error('Erro ao obter marcações:', error);
    res.status(500).json({ message: 'Erro ao obter marcações', error });
  }
};

// Obter marcações do utilizador autenticado
const getMarcacoesByUser = async (req, res) => {
  try {
    const marcacoes = await Marcacao.find({ userId: req.user.id })
      .populate('prato');

    res.status(200).json(marcacoes);

  } catch (error) {
    res.status(500).json({ message: 'Erro ao obter marcações do utilizador', error });
  }
};

// Obter marcação por ID
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

const updateMarcacao = async (req, res) => {
  const id = req.params.id;
  const { data_marcacao, horario, prato, estado } = req.body;

  try {
    const updateFields = {};

    if (data_marcacao) updateFields.data_marcacao = data_marcacao;
    if (horario) updateFields.horario = horario;

    if (prato) {
      const pratoEncontrado = await Pratos.findById(prato);
      if (!pratoEncontrado) {
        return res.status(404).json({ message: 'Prato não encontrado. Não foi possível atualizar a marcação.' });
      }
      updateFields.prato = prato;
    }

    if (estado) {
      updateFields.estado = estado;
    }

    const marcacaoAtualizada = await Marcacao.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    )
      .populate('userId', '-password')
      .populate('prato');

    if (!marcacaoAtualizada) {
      return res.status(404).json({ message: 'Marcação não encontrada' });
    }

    res.status(200).json({ message: 'Marcação atualizada com sucesso', marcacao: marcacaoAtualizada });
  } catch (error) {
    console.error('Erro ao atualizar marcação:', error);
    res.status(500).json({ message: 'Erro ao atualizar marcação', error });
  }
};

// Eliminar marcação
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

// Consumir marcação
const consumirMarcacao = async (req, res) => {
  const userId = req.user.id;
  const marcacaoId = req.params.id;

  try {
    const marcacao = await Marcacao.findById(marcacaoId);

    if (!marcacao) {
      return res.status(404).json({ message: 'Marcação não encontrada' });
    }

    if (String(marcacao.userId) !== userId) {
      return res.status(403).json({ message: 'Não autorizado a consumir esta marcação' });
    }

    if (marcacao.estado !== 'pedido') {
      return res.status(400).json({ message: 'Esta refeição já foi consumida ou está indisponível' });
    }

    const agora = new Date();
    const dataMarcacao = new Date(marcacao.data_marcacao);
    const mesmoDia =
      agora.getFullYear() === dataMarcacao.getFullYear() &&
      agora.getMonth() === dataMarcacao.getMonth() &&
      agora.getDate() === dataMarcacao.getDate();

    if (!mesmoDia) {
      return res.status(400).json({ message: 'Só é possível consumir no dia da marcação' });
    }

    const hora = agora.getHours();
    const minuto = agora.getMinutes();
    const horario = marcacao.horario.toLowerCase();

    if (horario === 'almoco') {
      if (hora < 12 || (hora === 14 && minuto > 0) || hora >= 14) {
        return res.status(400).json({ message: 'Almoço só pode ser consumido entre 12:00 e 14:00' });
      }
    } else if (horario === 'jantar') {
      if (hora < 19 || (hora === 21 && minuto > 0) || hora >= 21) {
        return res.status(400).json({ message: 'Jantar só pode ser consumido entre 19:00 e 21:00' });
      }
    } else {
      return res.status(400).json({ message: 'Horário de refeição inválido' });
    }

    marcacao.estado = 'servido';
    await marcacao.save();

    res.status(200).json({ message: 'Refeição consumida com sucesso', marcacao });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao consumir refeição', error });
  }
};

exports.createMarcacao = createMarcacao;
exports.getMarcacoes = getMarcacoes;
exports.getMarcacoesByUser = getMarcacoesByUser;
exports.getMarcacaoById = getMarcacaoById;
exports.deleteMarcacao = deleteMarcacao;
exports.consumirMarcacao = consumirMarcacao;
exports.updateMarcacao = updateMarcacao;
exports.createMarcacaoForUser = createMarcacaoForUser;

