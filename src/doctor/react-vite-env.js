const fs = require("fs");
const path = require("path");

const REQUIRED_VARIABLES = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
];

function checkReactViteFirebaseEnv(projectRoot) {
    const envPath = path.join(projectRoot, ".env.local");

    if (!fs.existsSync(envPath)) {
        return {
            passed: false,
            exists: false,
            message: "React Vite Firebase environment configuration not found",
            missing: REQUIRED_VARIABLES,
        };
    }

    const content = fs.readFileSync(envPath, "utf8");

    const missing = REQUIRED_VARIABLES.filter((variable) => {
        const pattern = new RegExp(`^${variable}=.+$`, "m");
        return !pattern.test(content);
    });

    if (missing.length > 0) {
        return {
            passed: false,
            exists: true,
            message: "React Vite Firebase environment configuration is incomplete",
            missing,
        };
    }

    return {
        passed: true,
        exists: true,
        message: "React Vite Firebase environment configuration is valid",
        missing: [],
    };
}

module.exports = {
    checkReactViteFirebaseEnv,
    REQUIRED_VARIABLES,
};
