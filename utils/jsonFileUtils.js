const fs = require("fs");

const readJson = async (filePath) => {
    const bufferContent = await fs.readFile(filePath);
    return JSON.parse(bufferContent);
};

const writeJson = async (filePath, jsonObject) => {
    const stringContent = JSON.stringify(jsonObject)
    await fs.writeFile(filePath, stringContent);
};

module.exports = {
    readJson,
    writeJson
};