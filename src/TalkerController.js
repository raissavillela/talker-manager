const fs = require('fs').promises;

const HTTP_CREATED_STATUS = 201;
const HTTP_INTERNAL_SERVER_ERROR_STATUS = 500;
const HTTP_NOT_FOUND_STATUS = 404;
const HTTP_OK_STATUS = 200;

async function getSpeakers() {
  try {
    const talkers = await fs.readFile('./src/talker.json', 'utf8');
    return JSON.parse(talkers);
  } catch (error) {
    console.error('Erro ao ler arquivo de palestrantes');
    return [];
  }
}

async function addSpeakers(req, res) {
  try {
    const newSpeakers = req.body;
    const speakers = await getSpeakers();
    newSpeakers.id = speakers.length + 1;
    speakers.push(newSpeakers);

    await fs.writeFile('./src/talker.json', JSON.stringify(speakers, null));

    res.status(HTTP_CREATED_STATUS).json(newSpeakers);
  } catch (error) {
    console.error('Erro ao adicionar palestrante:', error.message);
    res.status(HTTP_INTERNAL_SERVER_ERROR_STATUS)
      .json({ message: 'Erro ao salvar o palestrante' });
  }
}

const updateTalkersInArray = (talkers, id, updatedTalker) => talkers.map((talker) => {
  if (talker.id === parseInt(id, 10)) {
    return { ...talker, ...updatedTalker, id: talker.id };
  }
  return talker;
});

const writeFileAndRespond = async (talkers, id, res) => {
  await fs.writeFile('./src/talker.json', JSON.stringify(talkers, null, 2));

  const updatedTalkerIndex = talkers.findIndex((talker) => talker.id === parseInt(id, 10));
  if (updatedTalkerIndex === -1) {
    return res.status(HTTP_NOT_FOUND_STATUS).json({ message: 'Pessoa palestrante não encontrada' });
  }

  res.status(HTTP_OK_STATUS).json(talkers[updatedTalkerIndex]);
};

const handleError = (error, res) => {
  console.error(`Erro ao atualizar o palestrante: ${error.message}`);
  res.status(HTTP_INTERNAL_SERVER_ERROR_STATUS)
    .json({ message: 'Erro ao atualizar o palestrante' });
};

const updateSpeakers = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTalker = req.body;
    const talkers = await getSpeakers();
    const updatedTalkers = updateTalkersInArray(talkers, id, updatedTalker);

    await writeFileAndRespond(updatedTalkers, id, res);
  } catch (error) {
    handleError(error, res);
  }
};

module.exports = {
  getSpeakers,
  addSpeakers,
  updateSpeakers,
};