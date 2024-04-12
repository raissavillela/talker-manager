const express = require('express');
const fs = require('fs').promises;

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const HTTP_NOT_FOUND_STATUS = 404;
const PORT = process.env.PORT || '3001';

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

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});
