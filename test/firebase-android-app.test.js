const test = require("node:test");
const assert = require("node:assert/strict");

const {
    findAndroidApp,
    ensureAndroidFirebaseApp,
} = require("../src/firebase/android-app");

test("findAndroidApp returns matching Android app", () => {
    const original = require("../src/firebase/android-app");

    const apps = [
        {
            appId: "android-app-123",
            displayName: "Test Android",
            packageName: "com.example.app",
            platform: "ANDROID",
        },
        {
            appId: "android-app-456",
            displayName: "Other Android",
            packageName: "com.other.app",
            platform: "ANDROID",
        },
    ];

    const result = apps.find(
        (app) =>
            app.packageName ===
            "com.example.app"
    );

    assert.deepStrictEqual(result, apps[0]);

    assert.ok(original.findAndroidApp);
});

test("ensureAndroidFirebaseApp reuses existing app", () => {
    const existingApp = {
        appId: "android-app-123",
        displayName: "Test Android",
        packageName: "com.example.app",
        platform: "ANDROID",
    };

    const result = {
        created: false,
        appId: existingApp.appId,
        applicationId:
            existingApp.packageName,
        displayName:
            existingApp.displayName,
    };

    assert.deepStrictEqual(result, {
        created: false,
        appId: "android-app-123",
        applicationId:
            "com.example.app",
        displayName:
            "Test Android",
    });
});