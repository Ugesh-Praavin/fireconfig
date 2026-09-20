const fs = require("fs");
const path = require("path");

function generateReactViteEnv(projectRoot, config) {
    const envFile = path.join(
        projectRoot,
        ".env.local"
    );

    const content = [
        `VITE_FIREBASE_API_KEY=${config.apiKey}`,
        `VITE_FIREBASE_AUTH_DOMAIN=${config.authDomain}`,
        `VITE_FIREBASE_PROJECT_ID=${config.projectId}`,
        `VITE_FIREBASE_STORAGE_BUCKET=${config.storageBucket}`,
        `VITE_FIREBASE_MESSAGING_SENDER_ID=${config.messagingSenderId}`,
        `VITE_FIREBASE_APP_ID=${config.appId}`,
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
    generateReactViteEnv,
};