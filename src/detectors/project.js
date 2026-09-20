const fs = require("fs");
const path = require("path");

function detectProject(projectRoot = process.cwd()) {
    const packageJsonPath = path.join(
        projectRoot,
        "package.json"
    );

    if (!fs.existsSync(packageJsonPath)) {
        return {
            type: "unknown",
            name: null,
            reason: "package.json not found",
        };
    }

    let packageJson;

    try {
        packageJson = JSON.parse(
            fs.readFileSync(packageJsonPath, "utf8")
        );
    } catch {
        return {
            type: "unknown",
            name: null,
            reason: "Unable to read package.json",
        };
    }

    const dependencies = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {}),
    };

    if (dependencies.expo) {
        return {
            type: "expo",
            name: packageJson.name || null,
        };
    }

    if (dependencies["react-native"]) {
        return {
            type: "react-native",
            name: packageJson.name || null,
        };
    }

    if (dependencies.next) {
        return {
            type: "nextjs",
            name: packageJson.name || null,
        };
    }

    if (dependencies.react) {
        return {
            type: "react",
            name: packageJson.name || null,
        };
    }

    return {
        type: "unknown",
        name: packageJson.name || null,
        reason: "No supported framework detected",
    };
}

module.exports = {
    detectProject,
};