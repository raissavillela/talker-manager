const express = require('express');
const fs = require('fs').promises;

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
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
    res.status(500).json({ error: 'Palestrante não encontrado' });
  }
});

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});
