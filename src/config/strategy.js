function getConfigurationStrategy(projectType) {
    const strategies = {
        react: {
            type: "firebase-config",
            generator: "firebase-config",
        },

        "react-vite": {
            type: "environment",
            generator: "react-vite-env",
        },

        "react-cra": {
            type: "environment",
            generator: "react-cra-env",
        },

        nextjs: {
            type: "environment",
            generator: "nextjs-env",
        },

        "react-native": {
            type: "react-native-android",
            generator: "react-native-android",
        },

        expo: {
            type: "not-implemented",
            generator: null,
        },
    };

    return strategies[projectType] || null;
}

module.exports = {
    getConfigurationStrategy,
};