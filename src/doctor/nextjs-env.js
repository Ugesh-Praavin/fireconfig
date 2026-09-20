const fs = require("fs");
const path = require("path");

const REQUIRED_VARIABLES = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
];

function checkNextjsFirebaseEnv(projectRoot) {
    const envPath = path.join(
        projectRoot,
        ".env.local"
    );

    if (!fs.existsSync(envPath)) {
        return {
            passed: false,
            message: "Next.js Firebase environment configuration not found",
            missing: REQUIRED_VARIABLES,
        };
    }

    const content = fs.readFileSync(
        envPath,
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
            passed: false,
            message:
                "Next.js Firebase environment configuration is incomplete",
            missing,
        };
    }

    return {
        passed: true,
        message:
            "Next.js Firebase environment configuration is valid",
    };
}

module.exports = {
    checkNextjsFirebaseEnv,
};