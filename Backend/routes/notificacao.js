const express = require('express');
const router = express.Router();
const { validationResult, body, param } = require('express-validator');

const controller = require('../controller/notificacao');
const auth = require('../controller/auth');

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};


// Usuário logado vê suas notificações
router.get('/user', validateRequest, auth.validateUser, controller.getNotificacoes);

// Admin vê todas notificações
router.get('/admin', validateRequest, auth.validateAdmin, controller.getAllNotificacoes);

// Admin cria notificação
router.post('/admin', auth.validateAdmin, [
    body('mensagem').notEmpty().escape(),
    body('estado').optional().isIn(['lida', 'nao lida', 'apagada']),
],
    validateRequest, controller.createNotificacao(req, res)
);

// Admin atualiza notificação
router.put('/admin/:id', auth.validateAdmin, [
    param('id').notEmpty().escape(),
    body('mensagem').optional().escape(),
    body('estado').optional().isIn(['lida', 'nao lida', 'apagada']),
],
    validateRequest, controller.updateNotificacao(req, res)
);

// Admin deleta notificação
router.delete('/admin/:id', auth.validateAdmin, [
    param('id').notEmpty().escape(),
],
    validateRequest, controller.deleteNotificacao(req, res)
);

// Pegar notificação pelo ID - usuário ou admin
router.get('/:id', auth.validateUser, [
    param('id').notEmpty().escape(),
],
    validateRequest, controller.getNotificacaoById(req, res)
);

module.exports = router;
