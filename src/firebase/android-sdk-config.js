const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

function runFirebaseCommand(args) {
    if (process.platform === "win32") {
        return spawnSync(
            process.env.ComSpec || "cmd.exe",
            ["/d", "/s", "/c", "firebase", ...args],
            {
                encoding: "utf8",
                windowsHide: false,
            }
        );
    }

    return spawnSync(
        "firebase",
        args,
        {
            encoding: "utf8",
        }
    );
}

function getFirebaseAndroidSDKConfig(
    projectId,
    appId,
    {
        runCommandFn = runFirebaseCommand,
    } = {}
) {
    const tempDir =
        fs.mkdtempSync(
            path.join(
                os.tmpdir(),
                "fireconfig-firebase-"
            )
        );

    const configPath = path.join(
        tempDir,
        "google-services.json"
    );

    try {
        const result =
            runCommandFn([
                "apps:sdkconfig",
                "ANDROID",
                appId,
                "--out",
                configPath,
                "--project",
                projectId,
            ]);

        if (result.error) {
            throw result.error;
        }

        if (!fs.existsSync(configPath)) {
            throw new Error(
                "Firebase Android SDK configuration was not generated."
            );
        }

        const content =
            fs.readFileSync(
                configPath,
                "utf8"
            );

        if (!content.trim()) {
            throw new Error(
                "Firebase Android SDK configuration is empty."
            );
        }

        return {
            success: true,
            content,
            path: configPath,
        };
    } finally {
        fs.rmSync(
            tempDir,
            {
                recursive: true,
                force: true,
            }
        );
    }
}

module.exports = {
    getFirebaseAndroidSDKConfig,
};