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

const FIELD_TO_ENV_SUFFIX = {
    apiKey: "API_KEY",
    authDomain: "AUTH_DOMAIN",
    projectId: "PROJECT_ID",
    storageBucket: "STORAGE_BUCKET",
    messagingSenderId: "MESSAGING_SENDER_ID",
    appId: "APP_ID",
};

/**
 * Checks the Firebase initialization file (src/firebase/config.js).
 * Validates both literal string configurations (v0.2.1) and environment-based
 * initialization (v0.3.0) with framework-specific access/prefix checking.
 *
 * @param {string} projectRoot
 * @param {string|null} [expectedAccess] - "process.env" or "import.meta.env"
 * @param {string|null} [expectedPrefix] - e.g. "NEXT_PUBLIC_FIREBASE_"
 */
function checkFirebaseConfigFile(
    projectRoot,
    expectedAccess = null,
    expectedPrefix = null
) {
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

    // Check for syntax mismatch if framework access is specified
    if (expectedAccess) {
        const otherAccess =
            expectedAccess === "process.env"
                ? "import.meta.env"
                : "process.env";

        // If file uses otherAccess exclusively for firebase variables, flag syntax disagreement
        if (content.includes(otherAccess) && !content.includes(expectedAccess)) {
            return {
                passed: false,
                message: `Firebase configuration uses '${otherAccess}' but the detected framework requires '${expectedAccess}'`,
                missing: [],
            };
        }
    }

    const missing = REQUIRED_FIELDS.filter((field) => {
        // 1. Check for literal JSON value: "field": "value" or field: "value"
        const literalPattern = new RegExp(
            `["']?${field}["']?\\s*:\\s*["']([^"']+)["']`
        );
        if (literalPattern.test(content)) {
            return false;
        }

        // 2. Check for environment reference: field: access.prefixSUFFIX
        const envSuffix = FIELD_TO_ENV_SUFFIX[field];
        if (expectedAccess && expectedPrefix) {
            // Strict check for framework
            const escapedAccess = expectedAccess.replace(".", "\\.");
            const frameworkEnvPattern = new RegExp(
                `["']?${field}["']?\\s*:\\s*${escapedAccess}\\.${expectedPrefix}${envSuffix}`
            );
            if (frameworkEnvPattern.test(content)) {
                return false;
            }
        } else {
            // General env pattern
            const generalEnvPattern = new RegExp(
                `["']?${field}["']?\\s*:\\s*(?:process\\.env|import\\.meta\\.env)\\.[A-Z0-9_]+`
            );
            if (generalEnvPattern.test(content)) {
                return false;
            }
        }

        return true;
    });

    if (missing.length > 0) {
        return {
            passed: false,
            message: "Firebase configuration is incomplete",
            missing,
        };
    }

    const projectIdMatch =
        content.match(/"projectId"\s*:\s*["']([^"']+)["']/) ||
        content.match(/projectId\s*:\s*(?:process\.env|import\.meta\.env)\.([A-Z0-9_]+)/);

    const appIdMatch =
        content.match(/"appId"\s*:\s*["']([^"']+)["']/) ||
        content.match(/appId\s*:\s*(?:process\.env|import\.meta\.env)\.([A-Z0-9_]+)/);

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
    REQUIRED_FIELDS,
};