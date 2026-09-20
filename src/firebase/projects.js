const { spawnSync } = require("child_process");

function getFirebaseProjects() {
    let result;

    if (process.platform === "win32") {
        result = spawnSync(
            process.env.ComSpec || "cmd.exe",
            ["/d", "/s", "/c", "firebase", "projects:list", "--json"],
            {
                encoding: "utf8",
                windowsHide: true,
            }
        );
    } else {
        result = spawnSync(
            "firebase",
            ["projects:list", "--json"],
            {
                encoding: "utf8",
            }
        );
    }

    if (result.error || result.status !== 0) {
        return {
            success: false,
            projects: [],
            error: result.error?.message || result.stderr?.trim(),
        };
    }

    try {
        const data = JSON.parse(result.stdout);

        const projects = (data.result || []).map((project) => ({
            projectId: project.projectId,
            displayName: project.displayName,
        }));

        return {
            success: true,
            projects,
        };
    } catch (error) {
        return {
            success: false,
            projects: [],
            error: "Unable to parse Firebase project list.",
        };
    }
}


module.exports = {
    getFirebaseProjects,
};

