const Joi = require('joi');  // Ensure the correct import of Joi

const deletetableSchema = Joi.object({
    deleteTable: Joi.string().invalid('--- Choose Table ---').required(),
}).required();

module.exports = deletetableSchema;
