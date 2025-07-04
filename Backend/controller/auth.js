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

        req.user = {
            id: decoded.user_id,
            type_user: decoded.type_user
        };
        next();
    });
}


const validateUser = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token não fornecido ou inválido' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.SECRET);

        // Usa user_id como definiste no token
        if (!decoded || !decoded.user_id) {
            return res.status(401).json({ message: 'Token inválido (sem user_id)' });
        }

        req.user = { id: decoded.user_id }; // Agora está alinhado
        next();
    } catch (error) {
        console.error('Erro no validateUser:', error);
        return res.status(401).json({ message: 'Token inválido ou expirado', error });
    }
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
        if (user.type_user != "admin") {
            return res.status(403).json({ message: 'Forbidden.' });
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
        let token = jwt.sign(
            { user_id: user[0]._id, type_user: user[0].type_user },
            process.env.SECRET,
            { expiresIn: '1h' }
        );
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
                const b64 = Buffer.from(req.file.buffer).toString("base64");
                const dataURI = `data:${req.file.mimetype};base64,${b64}`;
                try {
                    const imagem = await cloudinary.uploader.upload(dataURI, { resource_type: "image" });
                    user_image = imagem;
                } catch (error) {
                    console.error("Erro no upload da imagem:", error);
                    return res.status(500).json({ message: "Erro ao fazer upload da imagem" });
                }
            }

            let regex = new RegExp('[a-z0-9]+@[a-z]+\.ipp.pt');

            let confirm = regex.test(req.body.email)

            const UsersToCreate = new Users({
                name: req.body.name,
                email: req.body.email,
                password: hash,
                avatar: user_image ? user_image.url : null,
                cloudinary_id: user_image ? user_image.public_id : null,
                type_user: confirm ? 'user' : 'admin',
                pontos_recompensas: 0,
                pontos_bom_comportamento: 10,
                recompensas: [],
                notificacoes: [],
                marcacoes: [],
                createdAt: Date.now()
            });

            try {
                Users.findOne({ email: req.body.email }).then(function (user) {
                    if (user === null) {
                        UsersToCreate.save()
                        res.status(201).json({ message: "Registered User" })
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
  const { name, email, password, avatar, pontos_bom_comportamento, pontos_recompensas } = req.body;

  try {
    const db_user = await Users.findById(req.user.id);
    const user = await Users.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    if (req.user.id !== user._id.toString() && db_user.type_user !== 'admin') {
      return res.status(401).json({ message: 'Não autorizado a atualizar este perfil.' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    if (req.file) {
      // Remove imagem antiga se existir
      if (user.cloudinary_id) {
        await cloudinary.uploader.destroy(user.cloudinary_id);
      }
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      try {
        const imagem = await cloudinary.uploader.upload(dataURI, { resource_type: "image" });
        user.avatar = imagem.secure_url;
        user.cloudinary_id = imagem.public_id;
      } catch (error) {
        return res.status(500).json({ message: "Erro ao fazer upload da imagem" });
      }
    } else if (avatar === null || avatar === '') {
      if (user.cloudinary_id) {
        await cloudinary.uploader.destroy(user.cloudinary_id);
      }
      user.avatar = null;
      user.cloudinary_id = null;
    }

    if (pontos_bom_comportamento !== undefined) {
      const pontosBomComportamentoNum = Number(pontos_bom_comportamento);
      if (isNaN(pontosBomComportamentoNum) || pontosBomComportamentoNum < 0) {
        return res.status(400).json({ message: "Pontos de bom comportamento inválidos" });
      }
      user.pontos_bom_comportamento = pontosBomComportamentoNum;
    }

    if (pontos_recompensas !== undefined) {
      const pontosRecompensasNum = Number(pontos_recompensas);
      if (isNaN(pontosRecompensasNum) || pontosRecompensasNum < 0) {
        return res.status(400).json({ message: "Pontos de recompensas inválidos" });
      }
      user.pontos_recompensas = pontosRecompensasNum;
    }

    await user.save();
    res.status(200).json({ message: "Usuário atualizado com sucesso" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
};


exports.login = login;
exports.register = register;
exports.UpdateUser = UpdateUser;
exports.validateToken = validateToken;
exports.validateUser = validateUser;
exports.validateAdmin = validateAdmin;