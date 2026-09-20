const fs = require("fs");
const path = require("path");

function generateFirebaseConfig(projectRoot, config) {
    const firebaseDirectory = path.join(
        projectRoot,
        "src",
        "firebase"
    );

    const configFile = path.join(
        firebaseDirectory,
        "config.js"
    );

    const firebaseConfig = {
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId,
    };

    const content = `import { initializeApp } from "firebase/app";

const firebaseConfig = ${JSON.stringify(
        firebaseConfig,
        null,
        2
    )};

export const app = initializeApp(firebaseConfig);
`;

    fs.mkdirSync(firebaseDirectory, {
        recursive: true,
    });

    try {
        fs.writeFileSync(configFile, content, {
            encoding: "utf8",
            flag: "wx",
        });
    } catch (error) {
        if (error.code === "EEXIST") {
            return {
                success: false,
                exists: true,
                path: configFile,
            };
        }

        throw error;
    }

    return {
        success: true,
        exists: false,
        path: configFile,
    };
}

module.exports = {
    generateFirebaseConfig,
};