const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
    generateReactNativeAndroidConfig,
} = require("../src/generators/react-native-android");

function createProject() {
    const projectRoot = fs.mkdtempSync(
        path.join(
            os.tmpdir(),
            "fireconfig-rn-"
        )
    );

    fs.mkdirSync(
        path.join(
            projectRoot,
            "android",
            "app"
        ),
        {
            recursive: true,
        }
    );

    return projectRoot;
}

test("generates React Native Android Firebase config", () => {
    const projectRoot =
        createProject();

    const config = JSON.stringify({
        project_info: {
            project_id: "test-project",
        },
    });

    const result =
        generateReactNativeAndroidConfig(
            projectRoot,
            config
        );

    assert.equal(result.success, true);
    assert.equal(result.exists, false);

    const configPath = path.join(
        projectRoot,
        "android",
        "app",
        "google-services.json"
    );

    assert.equal(
        fs.existsSync(configPath),
        true
    );

    assert.equal(
        fs.readFileSync(
            configPath,
            "utf8"
        ),
        config
    );
});

test("does not overwrite existing React Native Android config", () => {
    const projectRoot =
        createProject();

    const configPath = path.join(
        projectRoot,
        "android",
        "app",
        "google-services.json"
    );

    const existingConfig =
        '{"existing":true}';

    fs.writeFileSync(
        configPath,
        existingConfig,
        "utf8"
    );

    const result =
        generateReactNativeAndroidConfig(
            projectRoot,
            '{"new":true}'
        );

    assert.equal(result.success, false);
    assert.equal(result.exists, true);

    assert.equal(
        fs.readFileSync(
            configPath,
            "utf8"
        ),
        existingConfig
    );
});

test("fails when React Native Android directory is missing", () => {
    const projectRoot =
        fs.mkdtempSync(
            path.join(
                os.tmpdir(),
                "fireconfig-rn-"
            )
        );

    const result =
        generateReactNativeAndroidConfig(
            projectRoot,
            "{}"
        );

    assert.equal(result.success, false);
    assert.equal(result.exists, false);
});