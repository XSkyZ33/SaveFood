const express = require('express');
const router = express.Router();

const controller = require('../controller/marcacao');
const auth = require('../controller/auth');
const { body, param, query, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

// Admin: lista todas ou por data
router.get('/', auth.validateAdmin, [
    query('data').optional().isISO8601()
], validateRequest, controller.getMarcacoes);

// User: lista as suas próprias
router.get('/me', auth.validateUser, controller.getMarcacoesByUser);

// Get por ID
router.get('/:id', auth.validateAdmin, [
    param('id').isMongoId()
], validateRequest, controller.getMarcacaoById);

// Criar marcação
router.post('/', auth.validateUser, [
    body('data_marcacao').notEmpty().isISO8601(),
    body('horario').notEmpty().isIn(['Almoco', 'Jantar']),
    body('prato').notEmpty().isMongoId()
], validateRequest, controller.createMarcacao);

// criar marcação para um utilizador específico (admin)
router.post('/user/:userId', auth.validateAdmin, [
    param('userId').isMongoId(),
    body('data_marcacao').notEmpty().isISO8601(),
    body('horario').notEmpty().isIn(['Almoco', 'Jantar']),
    body('prato').notEmpty().isMongoId()
], validateRequest, controller.createMarcacaoForUser);


// Consumir marcação
router.post('/:id/consumir', auth.validateUser, [
    param('id').isMongoId()
], validateRequest, controller.consumirMarcacao);

router.patch('/:id', auth.validateAdmin, [
    param('id').isMongoId(),
    body('data_marcacao').optional().isISO8601(),
    body('horario').optional().isIn(['Almoco', 'Jantar']),
    body('prato').optional().isMongoId(),
    body('estado').optional().isIn(['pedido', 'servido', 'cancelado', 'nao servido']),
], validateRequest, controller.updateMarcacao);

// Eliminar
router.delete('/:id', auth.validateAdmin, [
    param('id').isMongoId()
], validateRequest, controller.deleteMarcacao);

module.exports = router;
