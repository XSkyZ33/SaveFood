const express = require('express');
const router = express.Router();
const { validationResult, body, param, query } = require('express-validator');

const controller = require('../controller/recompensa.js');
const auth = require('../controller/auth.js');

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

router.get('/', [
    query('tipo_recompensa')
        .optional()
        .isIn(['voucher', 'codigo_desconto', 'produto'])
        .withMessage('Tipo de recompensa inválido'),],
    validateRequest, controller.getRecompensas
);

router.get('/:id', [
    param('id').notEmpty().withMessage("ID obrigatório").isMongoId().withMessage("ID inválido"),
], validateRequest, controller.getRecompensaById);

router.post('/resgatar', auth.validateUser, [
    body('recompensaId')
        .notEmpty().withMessage("recompensaId é obrigatório")
        .isMongoId().withMessage("ID de recompensa inválido"),
], validateRequest, controller.resgatarRecompensa);

router.post('/', auth.validateAdmin, [
    body('objetivo').isInt({ min: 1 }).withMessage("Objetivo deve ser um número inteiro positivo"),
    body('descricao').notEmpty().escape(),
    body('tipo_recompensa')
        .isIn(['voucher', 'codigo_desconto', 'produto'])
        .withMessage("Tipo de recompensa inválido")
], validateRequest, controller.createRecompensa);

router.patch('/:id', auth.validateAdmin, [
    param('id').notEmpty().isMongoId().withMessage("ID inválido"),
    body('objetivo').optional().isInt({ min: 1 }),
    body('descricao').optional().escape(),
    body('tipo_recompensa').optional().isIn(['voucher', 'codigo_desconto', 'produto']),
], validateRequest, controller.updateRecompensa);

router.delete('/:id', auth.validateAdmin, [
    param('id').notEmpty().isMongoId().withMessage("ID inválido"),
], validateRequest, controller.deleteRecompensa);

module.exports = router;
