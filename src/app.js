const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(bodyParser.json());

// Routes / Apis
const apiRouter = require('./routes/routes');
app.use('/api', apiRouter);

module.exports = app;
