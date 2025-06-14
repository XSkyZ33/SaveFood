const express = require('express');
const router = express.Router();

const controller = require('../controller/marcacao.js'); // ajusta o caminho se necessário

const auth = require('../controller/auth.js');
const { body, param, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

router.get('/', auth.validateAdmin, controller.getMarcacoes);

router.get('/user', auth.validateUser, controller.getMarcacoesByUser);

router.get('/:id', auth.validateUser, [
    param('id').notEmpty().escape(),
], validateRequest, controller.getMarcacaoById);

router.post('/',
    auth.validateUser, [
    body('data_marcacao').notEmpty().isISO8601(),
    body('horario').notEmpty().isIn(['Almoco', 'Jantar']),
    body('prato').notEmpty().isMongoId(),
],
    validateRequest,
    controller.createMarcacao
);

router.post('/consumir', auth.validateUser, controller.consumirMarcacao);

router.put('/:id/estado', auth.validateAdmin, [
    param('id').notEmpty().escape(),
    body('estado').isIn(['pedido', 'servido', 'cancelado', 'nao servido'])
], validateRequest, controller.updateEstadoMarcacao);

router.delete('/:id', auth.validateAdmin, [
    param('id').notEmpty().escape()
], validateRequest, controller.deleteMarcacao);

module.exports = router;
