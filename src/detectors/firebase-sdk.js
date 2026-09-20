const fs = require("fs");
const path = require("path");

function detectFirebaseSDK(projectRoot) {
    const packageJsonPath = path.join(
        projectRoot,
        "package.json"
    );

    if (!fs.existsSync(packageJsonPath)) {
        return {
            installed: false,
            version: null,
        };
    }

    const packageJson = JSON.parse(
        fs.readFileSync(packageJsonPath, "utf8")
    );

    const dependencies = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {}),
    };

    return {
        installed: Boolean(dependencies.firebase),
        version: dependencies.firebase || null,
    };
}

module.exports = {
    detectFirebaseSDK,
};