const { confirm } = require("@inquirer/prompts");

async function confirmEnvOverwrite(key, existingValue, newValue) {
    return confirm({
        message: `Environment variable "${key}" already exists with a different value (${existingValue}). Replace it with "${newValue}"?`,
        default: false,
    });
}

module.exports = {
    confirmEnvOverwrite,
};
