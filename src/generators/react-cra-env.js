const { mergeEnvFile } = require("../config/env-merger");

async function generateReactCraEnv(projectRoot, config, options = {}) {
    const variables = {
        REACT_APP_FIREBASE_API_KEY: config.apiKey,
        REACT_APP_FIREBASE_AUTH_DOMAIN: config.authDomain,
        REACT_APP_FIREBASE_PROJECT_ID: config.projectId,
        REACT_APP_FIREBASE_STORAGE_BUCKET: config.storageBucket,
        REACT_APP_FIREBASE_MESSAGING_SENDER_ID: config.messagingSenderId,
        REACT_APP_FIREBASE_APP_ID: config.appId,
    };

    return mergeEnvFile(projectRoot, ".env.local", variables, options);
}

module.exports = {
    generateReactCraEnv,
};