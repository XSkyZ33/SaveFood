const express = require('express');
const router = express.Router();
const { validationResult, body, param } = require('express-validator');

const controller = require('../controller/prato');
const auth = require('../controller/auth');

const multer = require('multer');
const storage = multer.memoryStorage();
const multerUploads = multer({ storage }).single('image');

// Validador de requests
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

// Obter todos os pratos
router.get('/', controller.getPratos);

// Buscar pratos por tipo (antes do :id para evitar conflito)
router.get('/tipo/:tipo',
    [param('tipo').notEmpty().escape()],
    validateRequest,
    controller.getPratosByTipo
);

// Buscar prato por ID
router.get('/:id',
    [param('id').notEmpty().escape()],
    validateRequest,
    controller.getPratoById
);

// Criar prato (admin)
router.post('/',
    multerUploads,
    auth.validateAdmin,
    [
        body('nome').notEmpty().escape(),
        body('descricao').notEmpty().escape(),
        body('tipo_prato').notEmpty().escape()
    ],
    validateRequest,
    controller.createPrato
);

// Atualizar prato (admin)
router.put('/:id',
    multerUploads,
    auth.validateAdmin,
    [
        param('id').notEmpty().escape(),
        body('nome').optional().escape(),
        body('descricao').optional().escape(),
        body('tipo_prato').optional().escape()
    ],
    validateRequest,
    controller.updatePrato
);

// Deletar prato (admin)
router.delete('/:id',
    auth.validateAdmin,
    [
        param('id').notEmpty().escape()
    ],
    validateRequest,
    controller.deletePrato
);

module.exports = router;
