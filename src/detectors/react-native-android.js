const fs = require("fs");
const path = require("path");

function detectReactNativeAndroid(projectRoot) {
    const gradleFile = path.join(
        projectRoot,
        "android",
        "app",
        "build.gradle"
    );

    if (!fs.existsSync(gradleFile)) {
        return {
            detected: false,
            applicationId: null,
            path: gradleFile,
        };
    }

    const content = fs.readFileSync(
        gradleFile,
        "utf8"
    );

    const applicationIdMatch = content.match(
        /applicationId\s+["']([^"']+)["']/
    );

    if (!applicationIdMatch) {
        return {
            detected: false,
            applicationId: null,
            path: gradleFile,
        };
    }

    return {
        detected: true,
        applicationId: applicationIdMatch[1],
        path: gradleFile,
    };
}

module.exports = {
    detectReactNativeAndroid,
};