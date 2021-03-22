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

export const readFolder = async id => {
    let response = await fetch(`/fs/${id}`);
    let fileSystem = await response.json();
    return fileSystem;
};

export const readFile = async id => {
    let response = await fetch(`/fs/${id}`);
    let text = await response.text();

    return {
        id,
        name: "",
        type: "file",
        content: text,
    };
};

export const createFile = async file => {
    let response = await fetch(`/fs/${file.id}`, {
        method: "POST",
        body: JSON.stringify(file),
    });
    return file;
};

export const createFolder = async folder => {
    let response = await fetch(`/fs/${folder.id}`, {
        method: "POST",
        body: JSON.stringify(folder),
    });
    return folder;
};

export const updateFolderName = (folder, name) => {
    return {
        ...folder,
        name,
    };
};

export const deleteFolder = async id => {
    await fetch(`/fs/${id}`, {
        method: "DELETE",
    });
    return id;
};

export const updateFileContent = async (file, content) => {
    let response = await fetch(`/fs/${file.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...file, content }),
    });
    return { ...file, content };
};

export const updateFileName = async (file, name) => {
    let response = await fetch(`/fs/${file.id}`, {
        method: "PATCH",
        body: JSON.stringify({ id: file.id, name }),
    });
    const newInfo = await response.json();
    return { ...file, ...newInfo };
};

export const deleteFile = async id => {
    await fetch(`/fs/${id}`, {
        method: "DELETE",
    });
    return id;
};

export const updateProject = name => {
    return name;
};
