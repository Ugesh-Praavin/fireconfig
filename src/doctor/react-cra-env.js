const fs = require("fs");
const path = require("path");

const REQUIRED_VARIABLES = [
    "REACT_APP_FIREBASE_API_KEY",
    "REACT_APP_FIREBASE_AUTH_DOMAIN",
    "REACT_APP_FIREBASE_PROJECT_ID",
    "REACT_APP_FIREBASE_STORAGE_BUCKET",
    "REACT_APP_FIREBASE_MESSAGING_SENDER_ID",
    "REACT_APP_FIREBASE_APP_ID",
];

function checkReactCraFirebaseEnv(projectRoot) {
    const envFile = path.join(
        projectRoot,
        ".env.local"
    );

    if (!fs.existsSync(envFile)) {
        return {
            valid: false,
            passed: false,
            exists: false,
            missing: REQUIRED_VARIABLES,
            message:
                "React CRA Firebase environment configuration not found",
        };
    }

    const content = fs.readFileSync(
        envFile,
        "utf8"
    );

    const missing = REQUIRED_VARIABLES.filter(
        (variable) => {
            const pattern = new RegExp(
                `^${variable}=.+$`,
                "m"
            );

            return !pattern.test(content);
        }
    );

    if (missing.length > 0) {
        return {
            valid: false,
            passed: false,
            exists: true,
            missing,
            message:
                "React CRA Firebase environment configuration is incomplete",
        };
    }

    return {
        valid: true,
        passed: true,
        exists: true,
        missing: [],
        message:
            "React CRA Firebase environment configuration is valid",
    };
}

module.exports = {
    checkReactCraFirebaseEnv,
};