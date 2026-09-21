const { input } = require("@inquirer/prompts");

async function promptFirebaseProjectDetails() {
    const projectId = await input({
        message: "Enter a Firebase project ID:",
        validate: (value) => {
            const trimmed = value.trim();

            if (!trimmed) {
                return "Project ID is required.";
            }

            if (!/^[a-z0-9-]+$/.test(trimmed)) {
                return "Project ID can only contain lowercase letters, numbers, and hyphens.";
            }

            if (trimmed.length < 6 || trimmed.length > 30) {
                return "Project ID must be between 6 and 30 characters.";
            }

            return true;
        },
    });

    const displayName = await input({
        message: "Enter a display name for the Firebase project:",
        default: projectId.trim(),
        validate: (value) => {
            if (!value.trim()) {
                return "Display name is required.";
            }

            return true;
        },
    });

    return {
        projectId: projectId.trim(),
        displayName: displayName.trim(),
    };
}

module.exports = {
    promptFirebaseProjectDetails,
};