const { confirm } = require("@inquirer/prompts");

async function confirmCreateFirebaseWebApp() {
    return confirm({
        message: "No Firebase Web App found. Would you like to create one?",
        default: true,
    });
}

module.exports = {
    confirmCreateFirebaseWebApp,
};