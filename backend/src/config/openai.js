const { OpenAI } = require('openai');
require('dotenv').config();

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
    throw new Error('Missing OpenAI API key');
}

const openai = new OpenAI({
    apiKey: openaiApiKey
});

module.exports = openai; 