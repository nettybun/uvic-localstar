import {
    CREATE_FILE_SUCCESS,
    CREATE_FOLDER_SUCCESS,
    DELETE_FILE_SUCCESS,
    DELETE_FOLDER_SUCCESS,
    READ_FOLDER_SUCCESS,
    READ_PROJECT_SUCCESS,
    UPDATE_FILE_SUCCESS,
    UPDATE_FOLDER_SUCCESS,
    UPDATE_PROJECT_SUCCESS,
} from "../actions/actionTypes";
import initialState from "./initialState";

const projectReducer = (state = initialState.project, action) => {
    switch (action.type) {
        case READ_PROJECT_SUCCESS: {
            let fileSystem = action.project.fileSystem.map(item => {
                if (item.size === "")
                    return {
                        id: item.name,
                        name: item.name.slice(0, -1),
                        type: "folder",
                        content: [],
                    };
                else
                    return {
                        name: item.name,
                        id: item.name,
                        type: "file",
                    };
            });
            return {
                ...action.project,
                fileSystem,
            };
        }
        case DELETE_FOLDER_SUCCESS:
        case DELETE_FILE_SUCCESS: {
            let newFileSystem = state.fileSystem;
            const deleteFileFromFilesystem = (fileSystem, id) => {
                return fileSystem
                    .filter(item => item.id !== id)
                    .map(item => {
                        if (item.type === "file") {
                            return item;
                        }
                        return {
                            ...item,
                            content: deleteFileFromFilesystem(item.content, id),
                        };
                    });
            };

            return {
                ...state,
                fileSystem: deleteFileFromFilesystem(newFileSystem, action.id),
            };
        }
        case CREATE_FOLDER_SUCCESS:
        case CREATE_FILE_SUCCESS: {
            let newFileSystem = state.fileSystem;

            const addFileToFileSystem = fileSystem => {
                return fileSystem.map(item => {
                    if (item.type === "file") return item;
                    else if (item.id === action.parentID) {
                        return {
                            ...item,
                            content: [...item.content, action.item],
                        };
                    } else {
                        return {
                            ...item,
                            content: addFileToFileSystem(item.content),
                        };
                    }
                });
            };
            if (action.parentID === null) {
                newFileSystem = [...newFileSystem, action.item];
            } else {
                newFileSystem = addFileToFileSystem(newFileSystem);
            }
            return {
                ...state,
                fileSystem: newFileSystem,
            };
        }
        case UPDATE_PROJECT_SUCCESS:
            return {
                ...state,
                name: action.name,
            };
        case UPDATE_FILE_SUCCESS: {
            console.log(action.file);
            let newFileSystem = state.fileSystem;
            const updateFilesystem = fileSystem => {
                return fileSystem.map(item => {
                    if (item.type === "file") {
                        if (item.id === action.file.id) {
                            return { ...item, name: action.file.name };
                        }
                        return item;
                    }
                    return {
                        ...item,
                        content: updateFilesystem(item.content),
                    };
                });
            };

            return {
                ...state,
                fileSystem: updateFilesystem(newFileSystem),
            };
        }
        case UPDATE_FOLDER_SUCCESS: {
            let newFileSystem = state.fileSystem;
            const updateFilesystem = fileSystem => {
                return fileSystem.map(item => {
                    if (item.type === "file") {
                        return item;
                    }
                    if (item.id === action.folder.id) {
                        return {
                            ...item,
                            name: action.folder.name,
                            content: updateFilesystem(item.content),
                        };
                    }
                    return {
                        ...item,
                        content: updateFilesystem(item.content),
                    };
                });
            };

            return {
                ...state,
                fileSystem: updateFilesystem(newFileSystem),
            };
        }
        case READ_FOLDER_SUCCESS: {
            console.log(action.fileSystem);
            let newFolderContent = action.fileSystem.map(item => {
                if (item.size === "")
                    return {
                        id: action.id + item.name,
                        name: item.name.slice(0, -1),
                        type: "folder",
                        content: [],
                    };
                else
                    return {
                        name: item.name,
                        id: action.id + item.name,
                        type: "file",
                    };
            });
            let newFileSystem = state.fileSystem;
            const updateFilesystem = fileSystem => {
                return fileSystem.map(item => {
                    if (item.type === "file") {
                        return item;
                    }
                    if (item.id === action.id) {
                        return {
                            ...item,
                            content: newFolderContent,
                        };
                    }
                    return {
                        ...item,
                        content: updateFilesystem(item.content),
                    };
                });
            };

            return {
                ...state,
                fileSystem: updateFilesystem(newFileSystem),
            };
        }

        default:
            return state;
    }
};

export default projectReducer;
