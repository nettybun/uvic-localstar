import {
    CREATE_FILE_SUCCESS,
    DELETE_FILE_SUCCESS,
    READ_PROJECT_SUCCESS,
    UPDATE_PROJECT_SUCCESS,
} from "../actions/actionTypes";
import initialState from "./initialState";

const projectReducer = (state = initialState.project, action) => {
    switch (action.type) {
        case READ_PROJECT_SUCCESS:
            return action.project;
        case DELETE_FILE_SUCCESS: {
            let newFileSystem = { ...state.fileSystem };
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

            newFileSystem = {
                ...newFileSystem,
                content: deleteFileFromFilesystem(
                    newFileSystem.content,
                    action.id
                ),
            };

            return {
                ...state,
                fileSystem: newFileSystem,
            };
        }
        case CREATE_FILE_SUCCESS: {
            console.log("here");
            let newFileSystem = state.fileSystem;

            const addFileToFileSystem = (fileSystem, file, parentID) => {
                return fileSystem.map(item => {
                    console.log(item, parentID);
                    if (item.type === "file") return item;
                    else if (item.id === parentID) {
                        console.log("found folder");
                        return {
                            ...item,
                            content: [...item.content, file],
                        };
                    } else {
                        return {
                            ...item,
                            content: addFileToFileSystem(
                                item.content,
                                file,
                                parentID
                            ),
                        };
                    }
                });
            };
            if (state.fileSystem.id === action.parentID) {
                newFileSystem = {
                    ...newFileSystem,
                    content: [...newFileSystem.content, action.file],
                };
            } else {
                newFileSystem = {
                    ...newFileSystem,
                    content: addFileToFileSystem(
                        newFileSystem.content,
                        action.file,
                        action.parentID
                    ),
                };
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
        default:
            return state;
    }
};

export default projectReducer;
