const Joi = require('joi');
const { sendError } = require('../utils/response');

/**
 * Validate request body against Joi schema
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      return sendError(res, 'Validation failed', 400, { errors });
    }

    next();
  };
};

// Common validation schemas
const schemas = {
  signUp: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    username: Joi.string().min(3).max(20).required()
  }),

  gameSubmission: Joi.object({
    gameType: Joi.string().valid('phishing_detective', 'password_strength', 'url_inspector').required(),
    answers: Joi.array().items(Joi.object({
      questionId: Joi.string().required(),
      userAnswer: Joi.alternatives().try(Joi.string(), Joi.boolean(), Joi.number()).required(),
      timeTaken: Joi.number().min(0).required()
    })).required()
  }),

  updateProfile: Joi.object({
    username: Joi.string().min(3).max(20),
    photoURL: Joi.string().uri(),
    bio: Joi.string().max(200)
  })
};

module.exports = { validate, schemas };
