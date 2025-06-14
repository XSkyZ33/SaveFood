const express = require('express');
const router = express.Router();

const controller = require('../controller/estatstica.js');
const auth = require('../controller/auth.js');

const { validationResult, body, param } = require('express-validator')

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

router.get('/', controller.getEstatisticas)

router.get('/:id', [
    param('id').notEmpty().escape(),
], validateRequest, controller.getEstatisticaById);

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
        res.status(400).json({ errors: errors.array() })
    }
})


module.exports = router;