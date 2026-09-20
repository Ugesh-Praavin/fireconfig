const fs = require("fs");
const path = require("path");

const REQUIRED_FIELDS = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
];

function checkFirebaseConfigFile(projectRoot) {
    const configPath = path.join(
        projectRoot,
        "src",
        "firebase",
        "config.js"
    );

    if (!fs.existsSync(configPath)) {
        return {
            passed: false,
            message: "Firebase configuration not found",
            missing: REQUIRED_FIELDS,
        };
    }

    const content = fs.readFileSync(configPath, "utf8");

    const missing = REQUIRED_FIELDS.filter((field) => {
        const pattern = new RegExp(
            `"${field}"\\s*:\\s*["']([^"']+)["']`
        );

        return !pattern.test(content);
    });

    if (missing.length > 0) {
        return {
            passed: false,
            message: "Firebase configuration is incomplete",
            missing,
        };
    }

    const projectIdMatch = content.match(
        /"projectId"\s*:\s*["']([^"']+)["']/
    );

    const appIdMatch = content.match(
        /"appId"\s*:\s*["']([^"']+)["']/
    );

    return {
        passed: true,
        message: "Firebase configuration is valid",
        projectId: projectIdMatch?.[1] || null,
        appId: appIdMatch?.[1]
            ? `${appIdMatch[1].slice(0, 20)}...`
            : null,
    };
}

module.exports = {
    checkFirebaseConfigFile,
};