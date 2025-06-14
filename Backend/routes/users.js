const express = require('express');
const router = express.Router();

const { validationResult, body, param } = require('express-validator');

const controller = require('../controller/user.js');
const auth = require('../controller/auth.js');

const multer = require('multer');
let storage = multer.memoryStorage();
const multerUploads = multer({ storage }).single('image');

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

router.get('/', controller.getUser);

router.get('/me', auth.validateToken, controller.getAuthenticatedUser);

router.get('/:id', [
    param('id').notEmpty().escape(),
], validateRequest, controller.getUserById);

router.post('/login', [
    body('email').notEmpty().isEmail().normalizeEmail(),
    body('password').notEmpty().escape(),
], validateRequest, auth.login);

router.post('/register', multerUploads, [
    body('name').notEmpty().escape(),
    body('email').notEmpty().isEmail().normalizeEmail(),
    body('password').notEmpty().escape(),
], validateRequest, auth.register);

router.put('/:id', auth.validateToken, multerUploads, [
    param('id').notEmpty().escape(),
    body('nome').notEmpty().escape(),
    body('email').notEmpty().isEmail().normalizeEmail(),
    body('avatar').optional().isURL(),
], validateRequest, auth.updateUser);

router.delete('/:id', auth.validateAdmin, [
    param('id').notEmpty().escape(),
], validateRequest, controller.deleteUser);

module.exports = router;
