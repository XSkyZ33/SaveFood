const express = require('express');
const router = express.Router();

const { validationResult, body, param } = require('express-validator')

const controller = require('../controller/prato.js');
const auth = require('../controller/auth.js');

const multer = require('multer')
let storage = multer.memoryStorage();
// acccepts a single file upload: specifies the form field name where multer looks for the file
const multerUploads = multer({ storage }).single('image');

router.get('/', controller.getPratos);

router.get('/:id', [
    param('id').notEmpty().escape(),
], function (req, res) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        controller.getPratoById(req, res);
    } else {
        res.status(404).json({ errors: errors.array() })
    }
});

router.get('/tipo/:tipo', [
    param('tipo').notEmpty().escape(),
], function (req, res) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        controller.getPratosByTipo(req, res);
    } else {
        res.status(404).json({ errors: errors.array() })
    }
});

router.post('/', multerUploads, auth.validateAdmin, [
    body('nome').notEmpty().escape(),
    body('descricao').notEmpty().escape(),
    body('tipo_prato').notEmpty().escape(),
], function (req, res) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        controller.createPrato(req, res);
    } else {
        res.status(404).json({ errors: errors.array() })
    }
});

router.put('/:id', multerUploads, [
    param('id').notEmpty().escape(),
    body('nome').optional().escape(),
    body('descricao').optional().escape(),
    body('tipo_prato').optional().escape(),
], function (req, res) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        controller.updatePrato(req, res);
    } else {
        res.status(404).json({ errors: errors.array() })
    }
});

router.delete('/:id', [
    param('id').notEmpty().escape(),
], function (req, res) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        controller.deletePrato(req, res);
    } else {
        res.status(404).json({ errors: errors.array() })
    }
});

module.exports = router;