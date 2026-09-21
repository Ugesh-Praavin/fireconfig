const { spawnSync } = require("child_process");

function createFirebaseProject(
    projectId,
    displayName,
    spawn = spawnSync
) {
    let result;

    const args = [
        "projects:create",
        projectId,
        "--display-name",
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
            project: null,
            error:
                result.error?.message ||
                result.stderr?.trim() ||
                "Unable to create Firebase project.",
        };
    }

    return {
        success: true,
        project: {
            projectId,
            displayName,
        },
    };
}

module.exports = {
    createFirebaseProject,
};