const fs = require("fs");
const path = require("path");

function generateNextjsEnv(projectRoot, config) {
    const envFile = path.join(
        projectRoot,
        ".env.local"
    );

    const content = [
        `NEXT_PUBLIC_FIREBASE_API_KEY=${config.apiKey}`,
        `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${config.authDomain}`,
        `NEXT_PUBLIC_FIREBASE_PROJECT_ID=${config.projectId}`,
        `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${config.storageBucket}`,
        `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${config.messagingSenderId}`,
        `NEXT_PUBLIC_FIREBASE_APP_ID=${config.appId}`,
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
    generateNextjsEnv,
};