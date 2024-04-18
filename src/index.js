const express = require('express');
const fs = require('fs').promises;
const crypto = require('crypto');

const bodyParser = require('body-parser');
const {
  validateToken,
  validateName,
  ageValidation,
  validateTalk,
} = require('./validator');

const { addSpeakers, getSpeakers, updateSpeakers } = require('./TalkerController');

const HTTP_BAD_REQUEST_STATUS = 400;
const HTTP_NOT_FOUND_STATUS = 404;
const HTTP_OK_STATUS = 200;
const HTTP_NO_CONTENT_STATUS = 204;
const HTTP_INTERNAL_SERVER_ERROR_STATUS = 500;
const PORT = process.env.PORT || '3001';

const app = express();
app.use(bodyParser.json());

app.post('/talker', validateToken, validateName, ageValidation, validateTalk, addSpeakers);
app.put('/talker/:id', validateToken, validateName, ageValidation, validateTalk, updateSpeakers);

app.delete('/talker/:id', validateToken, async (req, res) => {
  try {
    const { id } = req.params;
    let talkers = await getSpeakers();

    const talkerIndex = talkers.findIndex((talker) => talker.id === parseInt(id, 10));
    if (talkerIndex === -1) {
      return res.status(HTTP_NOT_FOUND_STATUS)
        .json({ message: 'Pessoa palestrante não encontrada' });
    }
    talkers = talkers.filter((talker) => talker.id !== parseInt(id, 10));
    await fs.writeFile('./src/talker.json', JSON.stringify(talkers, null, 2));
    res.sendStatus(HTTP_NO_CONTENT_STATUS);
  } catch (error) {
    console.error(`Erro ao deletar a pessoa palestrante: ${error.message}`);
    res.status(HTTP_INTERNAL_SERVER_ERROR_STATUS)
      .json({ message: 'Erro ao deletar a pessoa palestrante' });
  }
});

app.get('/talker', async (req, res) => {
  try {
    const speakers = await getSpeakers();
    res.status(200).json(speakers);
  } catch (error) {
    console.error(`Erro ao obter os palestrantes: ${error.message}`);
    res.status(500).json({ message: 'Erro ao obter os palestrantes' });
  }
});

app.get('/talker', async (req, res) => {
  try {
    const data = await fs.readFile('src/talker.json', 'utf8');
    const talkers = JSON.parse(data);

    if (talkers.length === 0) {
      res.status(HTTP_OK_STATUS).json([]);
    } else {
      res.status(HTTP_OK_STATUS).json(talkers);
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler arquivo de palestrantes' });
  }
});

app.get('/talker/:id', async (req, res) => {
  const id = parseInt(req.params.id, 5);

  try {
    const data = await fs.readFile('src/talker.json', 'utf8');
    const talkers = JSON.parse(data);

    const foundTalker = talkers.find((talker) => talker.id === id);

    if (foundTalker) {
      res.status(HTTP_OK_STATUS).json(foundTalker);
    } else {
      res.status(HTTP_NOT_FOUND_STATUS).json({ message: 'Pessoa palestrante não encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler arquivo de palestrantes.' });
  }
});

const validEmail = (req, res, next) => {
  const { email } = req.body;
  if (!email || email.trim() === '') {
    return res.status(HTTP_BAD_REQUEST_STATUS)
      .json({ message: 'O campo "email" é obrigatório' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(HTTP_BAD_REQUEST_STATUS)
      .json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }
  next();
};

const validPassword = (req, res, next) => {
  const { password } = req.body;
  if (!password || password.trim() === '') {
    return res.status(HTTP_BAD_REQUEST_STATUS)
      .json({ message: 'O campo "password" é obrigatório' });
  }
  if (password.length < 6) {
    return res.status(HTTP_BAD_REQUEST_STATUS)
      .json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }
  next();
};

app.post('/login', validEmail, validPassword, (req, res) => {
  const token = crypto.randomBytes(8).toString('hex');
  res.status(HTTP_OK_STATUS).json({ token });
});

app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});
app.listen(PORT, () => {
  console.log('Online');
});