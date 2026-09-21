const { confirm } = require("@inquirer/prompts");

async function confirmCreateFirebaseProject(options = {}, promptConfirm = confirm) {
    const message =
        typeof options === "string"
            ? options
            : options.message || "No Firebase projects found. Would you like to create one?";

    return promptConfirm({
        message,
        default: true,
    });
}

async function confirmCreateNewFirebaseProject(options = {}, promptConfirm = confirm) {
    const message =
        typeof options === "string"
            ? options
            : options.message || "Would you like to create a new Firebase project?";

    return promptConfirm({
        message,
        default: true,
    });
}

module.exports = {
    confirmCreateFirebaseProject,
    confirmCreateNewFirebaseProject,
};