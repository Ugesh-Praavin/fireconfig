const { confirm } = require("@inquirer/prompts");

async function confirmConfigFileOverwrite(filePath) {
    return confirm({
        message: `Firebase initialization file already exists (${filePath}). Replace it?`,
        default: false,
    });
}

module.exports = {
    confirmConfigFileOverwrite,
};
