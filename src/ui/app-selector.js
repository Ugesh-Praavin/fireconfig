const { select } = require("@inquirer/prompts");

async function selectFirebaseWebApp(apps) {
    if (!apps || !apps.length) {
        return null;
    }

    if (apps.length === 1) {
        return apps[0];
    }

    const selectedApp = await select({
        message: "Multiple Firebase Web Apps found. Select one:",
        choices: apps.map((app) => ({
            name: `${app.displayName} (${app.appId})`,
            value: app,
        })),
    });

    return selectedApp;
}

module.exports = {
    selectFirebaseWebApp,
};
