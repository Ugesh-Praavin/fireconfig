const fs = require("fs");
const path = require("path");

function generateReactCraEnv(projectRoot, config) {
    const envFile = path.join(
        projectRoot,
        ".env.local"
    );

    const content = [
        `REACT_APP_FIREBASE_API_KEY=${config.apiKey}`,
        `REACT_APP_FIREBASE_AUTH_DOMAIN=${config.authDomain}`,
        `REACT_APP_FIREBASE_PROJECT_ID=${config.projectId}`,
        `REACT_APP_FIREBASE_STORAGE_BUCKET=${config.storageBucket}`,
        `REACT_APP_FIREBASE_MESSAGING_SENDER_ID=${config.messagingSenderId}`,
        `REACT_APP_FIREBASE_APP_ID=${config.appId}`,
        "",
    ].join("\n");

    try {
        fs.writeFileSync(envFile, content, {
            encoding: "utf8",
            flag: "wx",
        });
    } catch (error) {
        if (error.code === "EEXIST") {
            return {
                success: false,
                exists: true,
                path: envFile,
            };
        }

        throw error;
    }

    return {
        success: true,
        exists: false,
        path: envFile,
    };
}

module.exports = {
    generateReactCraEnv,
};