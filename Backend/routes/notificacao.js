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

// Usuário logado vê suas notificações
router.get('/user', auth.validateUser, controller.getNotificacoes);

// Admin vê todas notificações
router.get('/admin', auth.validateAdmin, controller.getAllNotificacoes);

// Admin cria notificação
router.post(
    '/admin',
    auth.validateAdmin,
    [
        body('userId').notEmpty().withMessage('userId é obrigatório'),
        body('mensagem').notEmpty().withMessage('Mensagem é obrigatória').escape(),
        body('estado').optional().isIn(['lida', 'nao lida', 'apagada'])
    ],
    validateRequest,
    controller.createNotificacao
);

// Admin atualiza notificação
router.put(
    '/admin/:id',
    auth.validateAdmin,
    [
        param('id').notEmpty().withMessage('ID é obrigatório').escape(),
        body('mensagem').optional().escape(),
        body('estado').optional().isIn(['lida', 'nao lida', 'apagada'])
    ],
    validateRequest,
    controller.updateNotificacao
);

// Admin deleta notificação
router.delete(
    '/admin/:id',
    auth.validateAdmin,
    [
        param('id').notEmpty().withMessage('ID é obrigatório').escape()
    ],
    validateRequest,
    controller.deleteNotificacao
);

// Pegar notificação pelo ID - usuário ou admin
router.get(
    '/:id',
    auth.validateUser,
    [
        param('id').notEmpty().withMessage('ID é obrigatório').escape()
    ],
    validateRequest,
    controller.getNotificacaoById
);

module.exports = router;
