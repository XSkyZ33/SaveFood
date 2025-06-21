const Estatistica = require('../Backend/models/estatistica');
const {
  getEstatisticas,
  getEstatisticasById,
  createEstatistica,
  updateEstatistica,
  deleteEstatistica
} = require('../Backend/controller/estatstica');

jest.mock('../Backend/models/estatistica'); // mocka o modelo do mongoose

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const next = jest.fn();

describe('Estatistica Controller', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEstatisticas', () => {
    it('deve retornar estatísticas filtradas', async () => {
      const req = { query: { tipo: 'diaria' } };
      const res = mockRes();

      Estatistica.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([{ tipo_estatistica: 'diaria' }])
      });

      await getEstatisticas(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ tipo_estatistica: 'diaria' }]);
    });

    it('deve retornar 404 se não houver estatísticas', async () => {
      const req = { query: {} };
      const res = mockRes();

      Estatistica.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      await getEstatisticas(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Nenhuma estatística encontrada' });
    });
  });

  describe('getEstatisticasById', () => {
    it('deve retornar uma estatística pelo ID', async () => {
      const req = { params: { id: '123' } };
      const res = mockRes();

      Estatistica.findById.mockResolvedValue({ _id: '123', tipo_estatistica: 'mensal' });

      await getEstatisticasById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ _id: '123', tipo_estatistica: 'mensal' });
    });

    it('deve retornar 404 se não encontrar a estatística', async () => {
      const req = { params: { id: '999' } };
      const res = mockRes();

      Estatistica.findById.mockResolvedValue(null);

      await getEstatisticasById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Estatística não encontrada' });
    });
  });

  describe('createEstatistica', () => {
    it('deve criar uma nova estatística', async () => {
      const req = {
        body: {
          tipo_estatistica: 'prato',
          observacao: 'Exemplo',
          dados: [{ valor: 100 }]
        }
      };
      const res = mockRes();

      Estatistica.prototype.save = jest.fn().mockResolvedValue(req.body);

      await createEstatistica(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Estatística criada com sucesso',
        estatistica: expect.any(Object)
      });
    });
  });

  describe('updateEstatistica', () => {
    it('deve atualizar uma estatística existente', async () => {
      const req = {
        params: { id: 'abc123' },
        body: {
          tipo_estatistica: 'mensal',
          observacao: 'Atualizado',
          dados: [{ novo: true }]
        }
      };
      const res = mockRes();

      Estatistica.findByIdAndUpdate.mockResolvedValue({ _id: 'abc123', ...req.body });

      await updateEstatistica(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Estatística atualizada com sucesso',
        estatistica: expect.any(Object)
      });
    });

    it('deve retornar 404 se estatística não existir', async () => {
      const req = {
        params: { id: 'semId' },
        body: {
          tipo_estatistica: 'anual',
          observacao: 'Nada',
          dados: []
        }
      };
      const res = mockRes();

      Estatistica.findByIdAndUpdate.mockResolvedValue(null);

      await updateEstatistica(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Estatística não encontrada' });
    });
  });

  describe('deleteEstatistica', () => {
    it('deve deletar uma estatística existente', async () => {
      const req = { params: { id: 'iddelete' } };
      const res = mockRes();

      Estatistica.findByIdAndDelete.mockResolvedValue({ _id: 'iddelete' });

      await deleteEstatistica(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Estatística deletada com sucesso' });
    });

    it('deve retornar 404 se não encontrar para deletar', async () => {
      const req = { params: { id: 'naoExiste' } };
      const res = mockRes();

      Estatistica.findByIdAndDelete.mockResolvedValue(null);

      await deleteEstatistica(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Estatística não encontrada' });
    });
  });
});
