const { mergeEnvFile } = require("../config/env-merger");

async function generateReactViteEnv(projectRoot, config, options = {}) {
    const variables = {
        VITE_FIREBASE_API_KEY: config.apiKey,
        VITE_FIREBASE_AUTH_DOMAIN: config.authDomain,
        VITE_FIREBASE_PROJECT_ID: config.projectId,
        VITE_FIREBASE_STORAGE_BUCKET: config.storageBucket,
        VITE_FIREBASE_MESSAGING_SENDER_ID: config.messagingSenderId,
        VITE_FIREBASE_APP_ID: config.appId,
    };

    return mergeEnvFile(projectRoot, ".env.local", variables, options);
}

module.exports = {
    generateReactViteEnv,
};