const Users = require("../models/users");

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

function validateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        return res.status(401).json({ message: 'No token provided.' });
    }
    jwt.verify(token, process.env.SECRET, function (err, decoded) {
        if (err) {
            return res.status(401).json({ message: 'Failed to authenticate token.' });
        }
        req.id = decoded.user_id;
        next();
    });
}

function validateUser(req, res, next) {
    const token = req.body.data_payload;
    if (!token) {
        return res.status(401).json({ message: 'No token provided.' });
    }
    jwt.verify(token, process.env.SECRET, function (err, decoded) {
        if (err) {
            return res.status(401).json({ message: 'Failed to authenticate token.' });
        }
        req.id = decoded.user_id;
        next();
    });
};

function validateAdmin(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        return res.status(401).json({ message: 'No token provided.' });
    }
    jwt.verify(token, process.env.SECRET, async function (err, decoded) {
        if (err) {
            return res.status(401).json({ message: 'Failed to authenticate token.' });
        }
        let user = await Users.findById(decoded.user_id).exec();
        if (user.admin != true) {
            return res.status(401).json({ message: 'Unauthorized.' });
        }
        req.id = decoded.user_id;
        next();
    });
}



const login = async (req, res) => {

    try {

        let user = await Users.find({ email: req.body.email }).exec();

        if (user.length == 0)
            res.status(404).json({ message: 'User not found' })
        let result = bcrypt.compareSync(req.body.password, user[0].password)
        if (result == false)
            return res.status(401).json({ message: 'Invalid Credentials' })
        let token = jwt.sign({ user_id: user[0]._id }, process.env.SECRET, { expiresIn: '1h' })
        res.status(200).json({ token: token })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err })
    }

};

const register = async (req, res) => {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(req.body.password, salt, async function (err, hash) {

            let user_image = null;

            if (req.file) {
                let img_file = req.file.path;
                let result = await cloudinary.uploader.upload(img_file);
                user_image = result;
            }

            let regex = new RegExp('[a-z0-9]+@[a-z]+\.ipp.pt');

            let confirm = regex.test(req.body.email)

            const UsersToCreate = new Users({
                name: req.body.name,
                email: req.body.email,
                password: hash,
                avatar: user_image ? user_image.url : null,
                cloudinary_id: user_image ? user_image.public_id : null,
                discount: confirm,
                admin: req.body.admin ? admin : false,
            });

            try {
                Users.findOne({ email: req.body.email }).then(function (user) {
                    if (user === null) {
                        UsersToCreate.save()
                        res.status(200).json({ message: "Registered User" })
                    }
                    else {
                        res.status(406).json({ message: "Duplicated User" });
                    }
                });
            } catch (err) {
                console.log(err)
                res.status(500).json({ message: err })
            }

        });
    });
}

const UpdateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, password, avatar } = req.body;
    try {
        const db_user = await Users.findById(req.id).exec();
        const user = await Users.findById(id).exec();

        console.log(db_user._id)
        console.log(user._id)

        if (db_user._id.toString() === user._id.toString() || db_user.admin === true) {
            if (name) {
                user.name = name;
            }
            if (email) {
                user.email = email;
            }
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                user.password = hashedPassword;
            }
            if (avatar) {
                let user_image = null;
                if (req.file) {
                    let img_file = req.file.path;
                    let result = await cloudinary.uploader.upload(img_file);
                    user_image = result;
                }
                user.avatar = user_image ? user_image.url : null;
                user.cloudinary_id = user_image ? user_image.public_id : null;
            }

            await user.save();
            res.status(200).json({ message: "Updated User" })

        } else {
            return res.status(401).json({ message: 'Unauthorized.' });
        }

    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
}


exports.login = login;
exports.register = register;
exports.validateToken = validateToken;
exports.validateAdmin = validateAdmin;
exports.validateUser = validateUser;
exports.UpdateUser = UpdateUser;