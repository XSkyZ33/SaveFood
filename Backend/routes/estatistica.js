const express = require('express');
const router = express.Router();

const controller = require('../controller/estatstica.js');
const auth = require('../controller/auth.js');

const { validationResult, body, param } = require('express-validator')

router.get('/', controller.getEstatisticas)

router.get('/:id', [
    param('id').notEmpty().escape(),
], function (req, res) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        controller.getEstatisticasById(req, res);
    } else {
        res.status(404).json({ errors: errors.array() })
    }
})

router.post('/tipo', [
    body('tipo_estatistica')
        .notEmpty().withMessage("O tipo_estatistica é obrigatório")
        .isIn(['diaria', 'mensal', 'anual', 'semanal', 'prato']).withMessage("Tipo inválido"),
], function (req, res) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        controller.getEstatisticasByTipo(req, res);
    } else {
        res.status(400).json({ errors: errors.array() }) // status 400 é melhor aqui
    }
});


router.post('/', auth.validateAdmin, [
    body('tipo_estatistica').notEmpty().escape(),
    body('observacao').notEmpty().escape(),
    body('dados').isArray({ min: 1 }).withMessage("Dados deve ser um array com pelo menos um elemento"),
    body('dados.*').isObject().withMessage("Cada elemento de dados deve ser um objeto"),
], function (req, res) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        controller.createEstatistica(req, res);
    } else {
        res.status(404).json({ errors: errors.array() })
    }
})


module.exports = router;