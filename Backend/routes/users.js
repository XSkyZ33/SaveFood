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

router.get('/', auth.validateAdmin, controller.getUser);

router.get('/me', auth.validateToken, controller.getAuthenticatedUser);

router.get('/:id', auth.validateAdmin, [
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

router.patch('/:id', auth.validateToken, auth.validateUser, multerUploads, [
    param('id').notEmpty().escape(),
    body('name').optional().notEmpty().escape(),
    body('email').optional().isEmail().normalizeEmail(),
    body('avatar').optional().isURL()
], validateRequest, auth.UpdateUser
);

router.delete('/:id', auth.validateToken, auth.validateAdmin, [
    param('id').notEmpty().escape(),
], validateRequest, controller.deleteUser);

module.exports = router;
