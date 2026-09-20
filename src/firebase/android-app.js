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

function getAndroidApps(projectId) {
    const result = runFirebaseCommand([
        "apps:list",
        "ANDROID",
        "--project",
        projectId,
        "--json",
    ]);

    if (result.error) {
        throw result.error;
    }

    const output = result.stdout || "";

    try {
        const parsed = JSON.parse(output);

        return parsed.result || [];
    } catch {
        throw new Error(
            "Unable to parse Firebase Android apps response."
        );
    }
}

function findAndroidApp(
    projectId,
    applicationId
) {
    const apps =
        getAndroidApps(projectId);

    return apps.find(
        (app) =>
            app.packageName ===
            applicationId
    ) || null;
}

function createAndroidApp(
    projectId,
    applicationId,
    displayName
) {
    const result = runFirebaseCommand([
        "apps:create",
        "ANDROID",
        displayName,
        "--package-name",
        applicationId,
        "--project",
        projectId,
    ]);

    if (result.error) {
        throw result.error;
    }

    const output =
        `${result.stdout || ""}\n${result.stderr || ""}`;

    const appIdMatch =
        output.match(
            /App ID:\s*([^\s]+)/i
        );

    if (!appIdMatch) {
        throw new Error(
            "Firebase Android app was created, but its App ID could not be determined."
        );
    }

    return {
        appId: appIdMatch[1],
        applicationId,
        displayName,
    };
}

function ensureAndroidFirebaseApp(
    projectId,
    applicationId,
    displayName = applicationId
) {
    const existing =
        findAndroidApp(
            projectId,
            applicationId
        );

    if (existing) {
        return {
            created: false,
            appId:
                existing.appId ||
                existing.appIdString,
            applicationId:
                existing.packageName,
            displayName:
                existing.displayName,
        };
    }

    return {
        created: true,
        ...createAndroidApp(
            projectId,
            applicationId,
            displayName
        ),
    };
}

module.exports = {
    getAndroidApps,
    findAndroidApp,
    createAndroidApp,
    ensureAndroidFirebaseApp,
};