const { GoogleGenAI } = require("@google/genai");
const { geminiApiKey } = require("./envConfigs");

const gemini = new GoogleGenAI({ apiKey: geminiApiKey });


module.exports = gemini;