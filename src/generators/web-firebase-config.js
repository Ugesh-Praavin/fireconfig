const fs = require("fs");
const path = require("path");

/**
 * Builds the content for src/firebase/config.js using framework-specific
 * environment access and prefix. Never hardcodes actual credential values.
 */
function buildWebFirebaseConfigContent(access = "process.env", prefix = "REACT_APP_FIREBASE_") {
    return `import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
    apiKey: ${access}.${prefix}API_KEY,
    authDomain: ${access}.${prefix}AUTH_DOMAIN,
    projectId: ${access}.${prefix}PROJECT_ID,
    storageBucket: ${access}.${prefix}STORAGE_BUCKET,
    messagingSenderId: ${access}.${prefix}MESSAGING_SENDER_ID,
    appId: ${access}.${prefix}APP_ID,
};

export const app =
    getApps().length > 0
        ? getApps()[0]
        : initializeApp(firebaseConfig);
`;
}

/**
 * Generates the web Firebase initialization file.
 *
 * @param {string} projectRoot - Absolute project root
 * @param {object} [options]
 * @param {string} [options.access] - "process.env" or "import.meta.env"
 * @param {string} [options.prefix] - Environment variable prefix
 * @param {string} [options.relativePath] - Defaults to "src/firebase/config.js"
 * @param {Function} [options.confirmOverwrite] - Async callback () => Promise<boolean>
 * @returns {Promise<{
 *   success: boolean,
 *   created: boolean,
 *   modified: boolean,
 *   skipped: boolean,
 *   exists: boolean,
 *   path: string
 * }>}
 */
async function generateWebFirebaseConfig(projectRoot, options = {}) {
    const relativePath =
        options.relativePath || path.join("src", "firebase", "config.js");
    const configFile = path.join(projectRoot, relativePath);
    const configDir = path.dirname(configFile);

    const access = options.access || "process.env";
    const prefix = options.prefix || "REACT_APP_FIREBASE_";
    const confirmOverwrite =
        options.confirmOverwrite || (async () => false);

    const desiredContent = buildWebFirebaseConfigContent(access, prefix);

    fs.mkdirSync(configDir, { recursive: true });

    if (fs.existsSync(configFile)) {
        const currentContent = fs.readFileSync(configFile, "utf8");

        // Idempotency: if already matching desired content, no action needed
        if (currentContent.trim() === desiredContent.trim()) {
            return {
                success: true,
                created: false,
                modified: false,
                skipped: false,
                exists: true,
                path: configFile,
            };
        }

        // File exists with different content -> ask before replacing
        const shouldOverwrite = await confirmOverwrite(configFile);

        if (!shouldOverwrite) {
            return {
                success: true,
                created: false,
                modified: false,
                skipped: true,
                exists: true,
                path: configFile,
            };
        }

        fs.writeFileSync(configFile, desiredContent, "utf8");
        return {
            success: true,
            created: false,
            modified: true,
            skipped: false,
            exists: true,
            path: configFile,
        };
    }

    // File does not exist -> create
    fs.writeFileSync(configFile, desiredContent, "utf8");

    return {
        success: true,
        created: true,
        modified: true,
        skipped: false,
        exists: false,
        path: configFile,
    };
}

module.exports = {
    generateWebFirebaseConfig,
    buildWebFirebaseConfigContent,
};
