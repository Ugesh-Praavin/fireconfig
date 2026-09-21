const { select } = require("@inquirer/prompts");

const CREATE_PROJECT_SENTINEL = "__CREATE_FIREBASE_PROJECT__";

async function selectFirebaseProject(projects, promptSelect = select) {
    if (!projects || !projects.length) {
        console.log("\n❌ No Firebase projects found.");
        return null;
    }

    const choices = [
        {
            name: "Create a new Firebase project",
            value: CREATE_PROJECT_SENTINEL,
        },
        ...projects.map((project) => ({
            name: `${project.displayName} (${project.projectId})`,
            value: project,
        })),
    ];

    const selectedProject = await promptSelect({
        message: "Select a Firebase project:",
        choices,
    });

    return selectedProject;
}

module.exports = {
    selectFirebaseProject,
    CREATE_PROJECT_SENTINEL,
};