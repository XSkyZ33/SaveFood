const jwt = require('jsonwebtoken');

describe('Verificação de token JWT', () => {
  const JWT_SECRET = 'segredo-de-teste';

  let token;

  beforeAll(() => {
    token = jwt.sign(
      { id: 'user123', email: 'teste@alunos.ipp.pt' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  test('Deve gerar um token válido', () => {
    expect(token).toBeDefined();
    const partes = token.split('.');
    expect(partes).toHaveLength(3);
  });

  test('Deve decodificar um token válido e conter ID e Email', () => {
    const decoded = jwt.verify(token, JWT_SECRET);
    expect(decoded).toHaveProperty('id', 'user123');
    expect(decoded).toHaveProperty('email', 'teste@alunos.ipp.pt');
  });

  test('Token expirado deve lançar erro', () => {
    const expiredToken = jwt.sign(
      { id: 'user999', email: 'expirado@ipp.pt' },
      JWT_SECRET,
      { expiresIn: '-10s' }
    );

    expect(() => {
      jwt.verify(expiredToken, JWT_SECRET);
    }).toThrow(/jwt expired/);
  });

  test('Token inválido deve lançar erro', () => {
    const invalidToken = token.slice(0, -1); // corrompe o token

    expect(() => {
      jwt.verify(invalidToken, JWT_SECRET);
    }).toThrow(/invalid signature/);
  });
});
