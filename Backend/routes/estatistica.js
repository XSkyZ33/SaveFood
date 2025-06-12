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

router.post('/tipo', function (req, res) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        controller.getEstatisticasByTipo(req, res);
    } else {
        res.status(404).json({ errors: errors.array() })
    }
})

router.post('/', auth.validateAdmin, [
    body('tipo').notEmpty().escape(),
    body('observacao').notEmpty().escape(),
    body('dados').notEmpty().escape(),
], function (req, res) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        controller.createEstatistica(req, res);
    } else {
        res.status(404).json({ errors: errors.array() })
    }
})


module.exports = router;