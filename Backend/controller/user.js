const Users = require('../models/users');

const getUserById = (req, res) => {
    try {
        Users.findById(req.params.id).then((user) => {
            if (!user) {
                res.status(404).json({ message: 'User not found' })
            }
            else {
                res.status(200).json({ user })
            }
        });
    } catch (error) {
        res.status(500).json({ message: err.message })
    }
};


const getUser = (req, res) => {
    try {
        Users.find().then((user) => {
            res.status(200).json({ user })
        });
    } catch (err) {
        res.status(500).json({ message: err.message })
    }

};


const deleteUser = async (req, res) => {
    try {
        let user = await Users.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' })
        }
        else {
            Users.findByIdAndRemove(req.params.id)
            res.status(200).json({ message: 'User deleted' })
        }
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
};

const getAuthenticatedUser = async (req, res) => {
    try {
        console.log("User ID:", req.id); // 👈 debugging
        const user = await Users.findById(req.id)
            .select('-password')               // primeiro escondes o campo
        if (!user) {
            return res.status(404).json({ message: 'Utilizador não encontrado' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Erro:", error); // 👈 debugging
        res.status(500).json({ message: 'Erro ao buscar utilizador', error });
    }
};

exports.getUserById = getUserById;
exports.getUser = getUser;
exports.deleteUser = deleteUser;
exports.getAuthenticatedUser = getAuthenticatedUser;
