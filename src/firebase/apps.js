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

async function getFirebaseWebApps(projectId) {
    try {
        const result = await runFirebaseCommand([
            "apps:list",
            "--project",
            projectId,
            "--json",
        ]);

        // IMPORTANT:
        // Firebase CLI on Windows may return useful JSON
        // and then exit with an assertion error.
        if (result.stdout.trim()) {
            try {
                const data = JSON.parse(result.stdout);

                const apps = (data.result || [])
                    .filter((app) => app.platform === "WEB")
                    .map((app) => ({
                        appId: app.appId,
                        displayName: app.displayName,
                        platform: app.platform,
                    }));

                if (apps.length > 0) {
                    return {
                        success: true,
                        apps,
                    };
                }

                return {
                    success: true,
                    apps: [],
                };
            } catch {
                // stdout wasn't valid JSON
                // Continue to error handling below.
            }
        }

        return {
            success: false,
            apps: [],
            error:
                result.stderr.trim() ||
                "Unable to retrieve Firebase Web Apps.",
        };
    } catch (error) {
        return {
            success: false,
            apps: [],
            error: error.message,
        };
    }
}



module.exports = {
    getFirebaseWebApps,
};