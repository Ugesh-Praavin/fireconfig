const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
    detectReactNativeAndroid,
} = require("../src/detectors/react-native-android");

function createTempProject(content) {
    const projectRoot = fs.mkdtempSync(
        path.join(
            os.tmpdir(),
            "fireconfig-rn-"
        )
    );

    const androidAppDir = path.join(
        projectRoot,
        "android",
        "app"
    );

    fs.mkdirSync(androidAppDir, {
        recursive: true,
    });

    fs.writeFileSync(
        path.join(androidAppDir, "build.gradle"),
        content,
        "utf8"
    );

    return projectRoot;
}

test("detects React Native Android applicationId", () => {
    const projectRoot = createTempProject(`
        android {
            defaultConfig {
                applicationId "com.example.app"
            }
        }
    `);

    const result =
        detectReactNativeAndroid(
            projectRoot
        );

    assert.deepStrictEqual(result.detected, true);
    assert.equal(
        result.applicationId,
        "com.example.app"
    );
});

test("returns not detected when build.gradle is missing", () => {
    const projectRoot = fs.mkdtempSync(
        path.join(
            os.tmpdir(),
            "fireconfig-rn-"
        )
    );

    const result =
        detectReactNativeAndroid(
            projectRoot
        );

    assert.deepStrictEqual(
        result.detected,
        false
    );

    assert.equal(
        result.applicationId,
        null
    );
});

test("returns not detected when applicationId is missing", () => {
    const projectRoot = createTempProject(`
        android {
            defaultConfig {
                minSdkVersion 24
            }
        }
    `);

    const result =
        detectReactNativeAndroid(
            projectRoot
        );

    assert.deepStrictEqual(
        result.detected,
        false
    );

    assert.equal(
        result.applicationId,
        null
    );
});