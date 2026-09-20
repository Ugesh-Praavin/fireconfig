const { spawn } = require("child_process");

function runFirebaseCommand(args) {
    return new Promise((resolve, reject) => {
        let command;
        let commandArgs;

        if (process.platform === "win32") {
            command = process.env.ComSpec || "cmd.exe";
            commandArgs = ["/d", "/s", "/c", "firebase", ...args];
        } else {
            command = "firebase";
            commandArgs = args;
        }

        const child = spawn(command, commandArgs, {
            windowsHide: true,
            shell: false,
        });

        let stdout = "";
        let stderr = "";

        child.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        child.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        child.on("error", reject);

        child.on("close", (code) => {
            resolve({
                code,
                stdout,
                stderr,
            });
        });
    });
}

async function getFirebaseSDKConfig(projectId, appId) {
    try {
        const result = await runFirebaseCommand([
            "apps:sdkconfig",
            "WEB",
            appId,
            "--project",
            projectId,
        ]);

        const output = result.stdout.trim();

        if (!output) {
            return {
                success: false,
                config: null,
                error:
                    result.stderr.trim() ||
                    "Firebase returned no SDK configuration.",
            };
        }

        try {
            const config = JSON.parse(output);

            return {
                success: true,
                config,
            };
        } catch {
            return {
                success: false,
                config: null,
                error: "Unable to parse Firebase SDK configuration.",
            };
        }
    } catch (error) {
        return {
            success: false,
            config: null,
            error: error.message,
        };
    }
}



module.exports = {
    getFirebaseSDKConfig,
};