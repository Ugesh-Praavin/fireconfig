const { spawnSync } = require("child_process");

function createFirebaseWebApp(
    projectId,
    displayName,
    spawn = spawnSync
) {
    let result;

    const args = [
        "--project",
        projectId,
        "apps:create",
        "WEB",
        displayName,
    ];

    if (process.platform === "win32") {
        result = spawn(
            process.env.ComSpec || "cmd.exe",
            ["/d", "/s", "/c", "firebase", ...args],
            {
                encoding: "utf8",
                windowsHide: true,
            }
        );
    } else {
        result = spawn(
            "firebase",
            args,
            {
                encoding: "utf8",
            }
        );
    }

    if (result.error || result.status !== 0) {
        return {
            success: false,
            app: null,
            error:
                result.error?.message ||
                result.stderr?.trim() ||
                "Unable to create Firebase Web App.",
        };
    }

    return {
        success: true,
        app: {
            displayName,
        },
    };
}

module.exports = {
    createFirebaseWebApp,
};