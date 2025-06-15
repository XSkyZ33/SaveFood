const Users = require('../models/users');

const getUserById = async (req, res) => {
    try {
        const user = await Users.findById(req.params.id).populate('recompensas');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUser = async (req, res) => {
    try {
        const users = await Users.find().populate('recompensas');
        res.status(200).json({ users });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar utilizadores', error: err.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await Users.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await Users.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAuthenticatedUser = async (req, res) => {
    try {
        const user = await Users.findById(req.user.id) // corrigido aqui
            .select('-password')
            .populate('recompensas')
            .populate('notificacoes')
            .populate('marcacoes');
        if (!user) {
            return res.status(404).json({ message: 'Utilizador não encontrado' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar utilizador', error });
    }
};


exports.getUserById = getUserById;
exports.getUser = getUser;
exports.deleteUser = deleteUser;
exports.getAuthenticatedUser = getAuthenticatedUser;
exports.getUserById = getUserById;
exports.getAuthenticatedUser = getAuthenticatedUser;