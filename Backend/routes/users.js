const express = require('express');
const router = express.Router();

const { validationResult, body, param } = require('express-validator')

const controller = require('../controller/user.js');
const auth = require('../controller/auth.js');

const multer = require('multer')
let storage = multer.memoryStorage();
const multerUploads = multer({ storage }).single('image');

router.get('/', controller.getUser);

router.get('/me', auth.validateToken, controller.getAuthenticatedUser);

router.get('/:id', [
    param('id').notEmpty().escape(),
], function (req, res) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        controller.getUserById(req, res);
    } else {
        res.status(404).json({ errors: errors.array() })
    }
});


router.post('/login', [
    body('email').notEmpty().isEmail().normalizeEmail(),
    body('password').notEmpty().escape(),
], function (req, res) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        auth.login(req, res);
    } else {
        res.status(404).json({ errors: errors.array() })
    }
});

router.post('/register', [
    body('name').notEmpty().escape(),
    body('email').notEmpty().isEmail().normalizeEmail(),
    body('password').notEmpty().escape(),
], function (req, res) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        auth.register(req, res);
    } else {
        res.status(404).json({ errors: errors.array() })
    }
});

router.put('/:id', auth.validateToken, [
    param('id').notEmpty().escape(),
    body('nome').notEmpty().escape(),
    body('email').notEmpty().isEmail().normalizeEmail(),
    body('avatar').optional().isURL(),
], function (req, res) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        auth.updateUser(req, res);
    } else {
        res.status(404).json({ errors: errors.array() })
    }
});

router.delete('/:id', auth.validateAdmin, [
    param('id').notEmpty().escape(),
], function (req, res) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        controller.deleteUser(req, res);
    } else {
        res.status(404).json({ errors: errors.array() })
    }
});

module.exports = router;