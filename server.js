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

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
