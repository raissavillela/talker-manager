const HTTP_BAD_REQUEST_STATUS = 400;
const HTTP_UNAUTHORIZED_STATUS = 401;

function validateToken(req, res, next) {
  const { authorization } = req.headers;
  if (authorization === undefined) {
    return res.status(HTTP_UNAUTHORIZED_STATUS).json(
      {
        message: 'Token não encontrado',
      },
    );
  }
  if (authorization.length !== 16) {
    return res.status(HTTP_UNAUTHORIZED_STATUS).json(
      {
        message: 'Token inválido',
      },
    );
  }
  next();
}

function validateName(req, res, next) {
  const { name } = req.body;
  if (name === undefined) {
    return res.status(HTTP_BAD_REQUEST_STATUS).json(
      {
        message: 'O campo "name" é obrigatório',
      },
    );
  }
  if (name.length < 3) {
    return res.status(HTTP_BAD_REQUEST_STATUS).json(
      {
        message: 'O "name" deve ter pelo menos 3 caracteres',
      },
    );
  }
  next();
}

function ageValidation(req, res, next) {
  const { age } = req.body;
  if (age === undefined) {
    return res.status(HTTP_BAD_REQUEST_STATUS).json(
      {
        message: 'O campo "age" é obrigatório',
      },
    );
  }
  if (!Number.isInteger(age) || age <= 18) {  
    return res.status(HTTP_BAD_REQUEST_STATUS).json(
      {
        message: 'O campo "age" deve ser um número inteiro igual ou maior que 18',
      },
    );
  }
  next();
}

function validateWatchedAt(req, res, next) {
  const { talk } = req.body;
  if (!talk.watchedAt) {
    return res.status(HTTP_BAD_REQUEST_STATUS)
      .json(
        {
          message: 'O campo "watchedAt" é obrigatório',
        },
      );
  }
  const isValidDate = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[012])\/[0-9]{4}$/;
  if (!isValidDate.test(talk.watchedAt)) {
    return res.status(HTTP_BAD_REQUEST_STATUS).json(
      { 
        message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"',
      },
    );
  }
  next();
}

function validateRate(req, res, next) {
  const { talk } = req.body;
  if (talk.rate === undefined) {
    return res.status(HTTP_BAD_REQUEST_STATUS).json(
      {
        message: 'O campo "rate" é obrigatório',
      },
    );
  }
  if (!Number.isInteger(talk.rate) || talk.rate <= 1 || talk.rate > 5) {
    return res.status(HTTP_BAD_REQUEST_STATUS).json(
      {
        message: 'O campo "rate" deve ser um número inteiro entre 1 e 5',
      },
    );
  }
  next();
}

function validateTalk(req, res, next) {
  const { talk } = req.body;
  if (talk === undefined) {
    return res.status(HTTP_BAD_REQUEST_STATUS).json(
      {
        message: 'O campo "talk" é obrigatório',
      },
    );
  }
  validateWatchedAt(req, res, () => {
    validateRate(req, res, next);
  });
}

module.exports = {
  validateToken,
  validateName,
  ageValidation,
  validateWatchedAt,
  validateRate,
  validateTalk,
};