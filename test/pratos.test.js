// tests/pratosController.test.js
const mockingoose = require('mockingoose');
const httpMocks = require('node-mocks-http');
const Prato = require('../Backend/models/pratos');
const { getPratos } = require('../Backend/controller/prato');

describe('GET /pratos - controlador getPratos', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('Deve retornar os pratos corretamente da base de dados', async () => {
    // Mock dos dados que virão da DB
    const pratosMock = [
      { _id: '1', nome: 'Bife', descricao: 'Delicioso bife', tipo_prato: 'Carne', imagem: 'url1' },
      { _id: '2', nome: 'Tofu', descricao: 'Tofu grelhado', tipo_prato: 'Vegetariano', imagem: 'url2' }
    ];

    // Simula o método find do Mongoose retornando pratosMock
    mockingoose(Prato).toReturn(pratosMock, 'find');

    // Criar req e res mock para passar para o controller
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/pratos',
      query: {}  // sem filtro
    });
    const res = httpMocks.createResponse();

    // Executa o controlador
    await getPratos(req, res);

    // Obtem os dados JSON enviados na resposta
    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(2);
    expect(data[0].nome).toBe('Bife');
    expect(data[1].tipo_prato).toBe('Vegetariano');
  });

  it('Deve filtrar pratos por tipo se query.tipo estiver presente', async () => {
    const pratosFiltrados = [
      { _id: '3', nome: 'Salada', descricao: 'Salada fresca', tipo_prato: 'Dieta', imagem: 'url3' }
    ];

    // Espera que find receba filtro { tipo_prato: 'Dieta' }
    mockingoose(Prato).toReturn(pratosFiltrados, 'find');

    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/pratos',
      query: { tipo: 'Dieta' }
    });
    const res = httpMocks.createResponse();

    await getPratos(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.length).toBe(1);
    expect(data[0].tipo_prato).toBe('Dieta');
  });
});
