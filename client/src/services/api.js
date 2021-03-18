import { project, files } from "./objects";

export const readProject = async () => {
    let response = await fetch("/fs/");
    let fileSystem = await response.json();

    return {
        name: "SENG499",
        authors: ["Dylan", "Michelle", "Grant"],
        dateCreated: Date.now(),
        fileSystem, //i guess json doesnt wana do?
    };
};

export const readFile = async id => {
    let response = await fetch(`/fs/${id}`);
    let text = await response.text();

    return {
        id,
        name: id,
        type: "file",
        content: text,
    };
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
