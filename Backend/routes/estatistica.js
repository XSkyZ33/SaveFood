const express = require('express');
const router = express.Router();

const controller = require('../controller/estatstica.js');
const auth = require('../controller/auth.js');

const { validationResult, query, body, param } = require('express-validator');

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

// Obter todas ou filtrar por tipo (ex: /estatisticas?tipo=diaria)
router.get('/', [
    query('tipo').optional().isIn(['diaria', 'mensal', 'anual', 'semanal', 'prato']).withMessage("Tipo inválido")
], validateRequest, controller.getEstatisticas);

// Obter estatística por ID
router.get('/:id', [
    param('id').notEmpty().escape(),
], validateRequest, controller.getEstatisticasById);

// Criar nova estatística
router.post('/', auth.validateAdmin, [
    body('tipo_estatistica').notEmpty().escape(),
    body('observacao').notEmpty().escape(),
    body('dados').isArray({ min: 1 }).withMessage("Dados deve ser um array com pelo menos um elemento"),
    body('dados.*').isObject().withMessage("Cada elemento de dados deve ser um objeto"),
], validateRequest, controller.createEstatistica);

router.patch('/:id', auth.validateAdmin, [
    param('id').notEmpty().escape(),
    body('tipo_estatistica').notEmpty().escape(),
    body('observacao').notEmpty().escape(),
    body('dados').isArray({ min: 1 }).withMessage("Dados deve ser um array com pelo menos um elemento"),
    body('dados.*').isObject().withMessage("Cada elemento de dados deve ser um objeto"),
], validateRequest, controller.updateEstatistica);

router.delete('/:id', auth.validateAdmin, [
    param('id').notEmpty().escape(),
], validateRequest, controller.deleteEstatistica);

module.exports = router;
