require('dotenv').config();

const express = require('express');
const app = express();

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })

const db = mongoose.connection;
const port = process.env.PORT || 3000;

db.on('error', (error) => console.error(error));
db.once('open', () => {
    console.log('Connected to Database');
});

app.use(express.json());

const usersRouter = require('./Backend/routes/users');
const marcacoesRouter = require('./Backend/routes/marcacao');
const estatisticasRouter = require('./Backend/routes/estatistica');
const pratosRouter = require('./Backend/routes/pratos');
const recompensasRouter = require('./Backend/routes/recompensas');


app.use('/users', usersRouter);
app.use('/marcacoes', marcacoesRouter);
app.use('/estatisticas', estatisticasRouter);
app.use('/pratos', pratosRouter);
app.use('/recompensas', recompensasRouter);


app.listen(port, () => {
    console.log(`Server started on port ${port}`);
    console.log(`http://localhost:${port}`);
});

