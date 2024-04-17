const express = require('express');
const fs = require('fs').promises;
const crypto = require('crypto');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';
const HTTP_NOT_FOUND_STATUS = 404;
const HTTP_BAD_REQUEST_STATUS = 400;

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
    res.status(500).json({ error: 'Erro ao ler arquivo' });
  }
});

app.get('/talker/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

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
    res.status(500).json({ error: 'Erro ao ler arquivo.' });
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

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});
