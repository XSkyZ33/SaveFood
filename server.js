require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })

const db = mongoose.connection;
const port = process.env.PORT || 3000;

db.on('error', (error) => console.error(error));
db.once('open', () => {
    console.log('Connected to Database');
});

app.use(express.json());

app.use(cors({
  origin: 'http://127.0.0.1:5500'  // ou 'http://localhost:5500'
}));


const usersRouter = require('./Backend/routes/users');
const marcacoesRouter = require('./Backend/routes/marcacao');
const estatisticasRouter = require('./Backend/routes/estatistica');
const pratosRouter = require('./Backend/routes/pratos');
const recompensasRouter = require('./Backend/routes/recompensas');
const notificacaosRouter = require('./Backend/routes/notificacao');


app.use('/users', usersRouter);
app.use('/marcacoes', marcacoesRouter);
app.use('/estatisticas', estatisticasRouter);
app.use('/pratos', pratosRouter);
app.use('/recompensas', recompensasRouter);
app.use('/notificacoes', notificacaosRouter);


app.listen(port, () => {
    console.log(`Server started on port ${port}`);
    console.log(`http://localhost:${port}`);
});

