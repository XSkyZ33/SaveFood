const express = require('express');
const router = express.Router();
const { validationResult, body, param } = require('express-validator')

const controller = require('../controller/recompensa.js');
const auth = require('../controller/auth.js');

router.get('/', controller.getRecompensas);

router.get('/:id', [
    param('id').notEmpty().escape(),
], function (req, res) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        controller.getRecompensaById(req, res);
    } else {
        res.status(404).json({ errors: errors.array() })
    }
});

router.post('/tipo', [
    body('tipo_recompensa')
        .notEmpty().withMessage("O tipo_recompensa é obrigatório")
        .isIn(['voucher', 'codigo_desconto', 'produto']).withMessage("Tipo inválido"),
], function (req, res) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        controller.getRecompensasByTipo(req, res);
    } else {
        res.status(400).json({ errors: errors.array() }) // status 400 é melhor aqui
    }
});

router.post('/resgatar', auth.validateUser, controller.resgatarRecompensa);

router.post('/', auth.validateAdmin, [
    body('objetivo').isInt({ min: 1 }).withMessage("Objetivo deve ser um número inteiro positivo"),
    body('descricao').notEmpty().escape(),
    body('tipo_recompensa').isIn(['voucher', 'codigo_desconto', 'produto']).withMessage("Tipo de recompensa inválido")
], async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        controller.createRecompensa(req, res);
    } else {
        res.status(400).json({ errors: errors.array() });
    }
});


module.exports = router;