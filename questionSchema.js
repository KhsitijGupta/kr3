const Joi = require('joi');  // Ensure the correct import of Joi

// Define the schema
const questionSchema = Joi.object({
    questionText: Joi.string().required(),
    optionA: Joi.string().required(),
    optionB: Joi.string().required(),
    optionC: Joi.string().required(),
    optionD: Joi.string().required(),  // Ensure optionD is only declared once
    correctOption: Joi.string().valid('A', 'B', 'C', 'D').required(),  // Limit to valid values
    difficultyLevel: Joi.string().valid('Easy', 'Medium', 'Hard').required(),  // Limit to specific values
    subjects: Joi.string().invalid('--Select Subjects Name--').required(),
}).required();

// Export the schema
module.exports = questionSchema;

