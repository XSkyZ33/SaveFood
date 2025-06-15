const express = require('express');
const router = express.Router();
const { validationResult, body, param } = require('express-validator');

const controller = require('../controller/notificacao');
const auth = require('../controller/auth');

// Middleware para validação de requests
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

// 🟢 User vê suas próprias notificações
router.get('/', auth.validateUser, controller.getNotificacoes);

// 🟢 Admin vê todas as notificações
router.get('/all', auth.validateAdmin, controller.getAllNotificacoes);

// 🔍 Admin vê uma notificação específica
router.get(
    '/:id',
    auth.validateAdmin,
    [
        param('id').notEmpty().withMessage('ID é obrigatório').escape()
    ],
    validateRequest,
    controller.getNotificacaoById
);

// 🔵 Admin cria notificação
router.post(
    '/',
    auth.validateAdmin,
    [
        body('userId').notEmpty().withMessage('userId é obrigatório'),
        body('mensagem').notEmpty().withMessage('Mensagem é obrigatória').escape(),
        body('estado').optional().isIn(['lida', 'nao lida', 'apagada'])
    ],
    validateRequest,
    controller.createNotificacao
);

// 🟡 Admin atualiza notificação
router.put(
    '/:id',
    auth.validateAdmin,
    [
        param('id').notEmpty().withMessage('ID é obrigatório').escape(),
        body('mensagem').optional().escape(),
        body('estado').optional().isIn(['lida', 'nao lida', 'apagada'])
    ],
    validateRequest,
    controller.updateNotificacao
);

// 🔴 Admin deleta notificação
router.delete(
    '/:id',
    auth.validateAdmin,
    [
        param('id').notEmpty().withMessage('ID é obrigatório').escape()
    ],
    validateRequest,
    controller.deleteNotificacao
);

module.exports = router;
