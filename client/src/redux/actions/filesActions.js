import {
    READ_FILE_SUCCESS,
    CREATE_FILE_SUCCESS,
    UPDATE_FILE_SUCCESS,
    DELETE_FILE_SUCCESS,
    UPDATE_FILE_NAME_SUCCESS,
} from "./actionTypes";
import {
    createFile,
    deleteFile,
    readFile,
    updateFileContent,
    updateFileName,
} from "../../services/api";

const readFileSucess = file => {
    return { type: READ_FILE_SUCCESS, file };
};

const createFileSucess = (file, parentID) => {
    return { type: CREATE_FILE_SUCCESS, item: file, parentID };
};

const updateFileSucess = file => {
    return { type: UPDATE_FILE_SUCCESS, file };
};

const updateFileNameSucess = (file, oldID) => {
    return { type: UPDATE_FILE_NAME_SUCCESS, file, oldID };
};

const deleteFileSucess = id => {
    return { type: DELETE_FILE_SUCCESS, id };
};

export const createFileDispatch = (name, parentID) => {
    return async dispatch => {
        const regex = new RegExp("^.*.(nb|sbnb)$");
        if (!regex.test(name)) {
            name += ".sbnb";
        }

        let id = name;
        if (parentID) {
            id = parentID + name;
        }

        const file = await createFile({
            id,
            name,
            type: "file",
            content: "# %% [javascript]",
        });

        dispatch(createFileSucess(file, parentID));
    };
};

export const readFileDispatch = id => {
    return async dispatch => {
        const file = await readFile(id);
        dispatch(readFileSucess(file));
    };
};

export const updateFileContentDispatch = (file, content) => {
    return async dispatch => {
        const newFile = await updateFileContent(file, content);

        dispatch(updateFileSucess(newFile));
    };
};

export const updateFileNameDispatch = (file, name) => {
    return async dispatch => {
        let newName = name;
        const regex = new RegExp("^.*.(nb|sbnb)$");
        if (!regex.test(name)) {
            newName += ".sbnb";
        }

        const newFile = await updateFileName(file, newName);

        dispatch(updateFileNameSucess(newFile, file.id));
    };
};

export const deleteFileDispatch = id => {
    return async dispatch => {
        const idToDelete = await deleteFile(id);
        dispatch(deleteFileSucess(idToDelete));
    };
};
