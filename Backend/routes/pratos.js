const express = require('express');
const router = express.Router();

const { validationResult, body, param } = require('express-validator')

const multer = require('multer')

const controller = require('../controller/prato.js');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + path.extname(file.originalname))
    }
});

const upload = multer({ storage }).single('image')

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

router.post('/', upload, [
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

router.put('/:id', upload, [
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