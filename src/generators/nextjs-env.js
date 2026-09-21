const { mergeEnvFile } = require("../config/env-merger");

async function generateNextjsEnv(projectRoot, config, options = {}) {
    const variables = {
        NEXT_PUBLIC_FIREBASE_API_KEY: config.apiKey,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: config.authDomain,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: config.projectId,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: config.storageBucket,
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: config.messagingSenderId,
        NEXT_PUBLIC_FIREBASE_APP_ID: config.appId,
    };

    return mergeEnvFile(projectRoot, ".env.local", variables, options);
}

module.exports = {
    generateNextjsEnv,
};