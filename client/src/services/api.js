import { project, files } from "./objects";

export const readProject = () => {
    return project;
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

export const updateFileContent = (file, content) => {
    return { ...file, content };
};

export const deleteFile = id => {
    return id;
};
