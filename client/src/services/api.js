// TODO: Actually support a *.sbnb-workspace project file lookup
export const readProject = async () => {
    let response = await fetch("/fs/");
    if (!response.ok) {
        return {
            name: 'No project loaded',
            authors: [],
            dateCreated: new Date(0),
            fileSystem: {}
        }
    }
    let fileSystem = await response.json();
    return {
        name: "SENG499",
        authors: ["Dylan", "Grant"],
        dateCreated: Date.now(),
        fileSystem,
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

export const updateFolderName = async (folder, name) => {
    let response = await fetch(`/fs/${folder.id}`, {
        method: "PATCH",
        body: JSON.stringify({ id: folder.id, name, type: "folder" }),
    });
    const newInfo = await response.json();
    return { ...folder, ...newInfo };
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
        body: JSON.stringify({ id: file.id, name, type: "file" }),
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
