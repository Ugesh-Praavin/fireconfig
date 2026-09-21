const { input } = require("@inquirer/prompts");

async function promptFirebaseWebAppDetails(defaultDisplayName = "Web App") {
    const displayName = await input({
        message: "Enter a display name for the Firebase Web App:",
        default: defaultDisplayName,
        validate: (value) => {
            if (!value.trim()) {
                return "Display name is required.";
            }
            return true;
        },
    });

    return {
        displayName: displayName.trim(),
    };
}

module.exports = {
    promptFirebaseWebAppDetails,
};
