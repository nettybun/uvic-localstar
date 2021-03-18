import { project, files } from "./objects";

export const readProject = () => {
    let response = fetch("/fs/")
        .then(res => res.json())
        .then(data => {
            return {
                name: "SENG499",
                authors: ["Dylan", "Michelle", "Grant"],
                dateCreated: Date.now(),
                fileSystem: data, //i guess json doesnt wana do?
            };
        });
};

export const readFile = id => {
    return files[id];
};

export const createFile = name => {
    return {
        id: Date.now(),
        type: "file",
        name,
        content: "",
    };
};

export const createFolder = name => {
    return {
        id: Date.now(),
        type: "folder",
        name,
        content: [],
    };
};

export const updateFolderName = (folder, name) => {
    return {
        ...folder,
        name,
    };
};

export const deleteFolder = id => {
    return id;
};

export const updateFileContent = (file, content) => {
    return { ...file, content };
};

export const updateFileName = (file, name) => {
    return { ...file, name };
};

export const deleteFile = id => {
    return id;
};

export const updateProject = name => {
    return name;
};
