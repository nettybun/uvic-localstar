export const files = {
    0: {
        id: 0,
        name: "file0",
        type: "file",
        content: `# %% [markdown]
# iFrame example for file 0
Try editing a cell! 
# %% [javascript]
const x = "Hello world!"
x`,
    },
    1: {
        id: 1,
        name: "file1",
        type: "file",
        content: `# %% [markdown]
# iFrame example for file 1
Try editing a cell! 
# %% [javascript]
const x = "Hello world!"
x`,
    },
    2: {
        id: 0,
        name: "file2",
        type: "file",
        content: `# %% [markdown]
# iFrame example for file 2
Try editing a cell! 
# %% [javascript]
const x = "Hello world!"
x`,
    },
    3: {
        id: 3,
        name: "file3",
        type: "file",
        content: `# %% [markdown]
# iFrame example for file 3
Try editing a cell! 
# %% [javascript]
const x = "Hello world!"
x`,
    },
};

export const project = {
    name: "SENG499",
    authors: ["Dylan", "Michelle", "Grant"],
    dateCreated: Date.now(),
    fileSystem: [
        {
            name: "home",
            type: "folder",
            id: 4,
            content: [
                {
                    id: 0,
                    name: "file1",
                    type: "file",
                },
                {
                    id: 1,
                    name: "file2",
                    type: "file",
                },
                {
                    name: "work",
                    type: "folder",
                    id: 2,
                    content: [
                        {
                            id: 3,
                            name: "workfile1",
                            type: "file",
                        },
                    ],
                },
            ],
        },
    ],
};
