import {
    CREATE_FOLDER_SUCCESS,
    READ_PROJECT_SUCCESS,
    UPDATE_PROJECT_SUCCESS,
    UPDATE_FOLDER_SUCCESS,
    DELETE_FOLDER_SUCCESS,
} from "./actionTypes";
import {
    readProject,
    updateProject,
    createFolder,
    deleteFolder,
    updateFolderName,
} from "../../services/api";

const readProjectSuccess = project => {
    return {
        type: READ_PROJECT_SUCCESS,
        project,
    };
};

const updateProjectSuccess = name => {
    return {
        type: UPDATE_PROJECT_SUCCESS,
        name,
    };
};

const createFolderSuccess = (folder, parentID) => {
    return {
        type: CREATE_FOLDER_SUCCESS,
        item: folder,
        parentID,
    };
};

const updateFolderSuccess = folder => {
    return {
        type: UPDATE_FOLDER_SUCCESS,
        folder,
    };
};

const deleteFolderSuccess = id => {
    return {
        type: DELETE_FOLDER_SUCCESS,
        id,
    };
};

export const readProjectDispatch = () => {
    return async dispatch => {
        let project = await readProject();
        dispatch(readProjectSuccess(project));
    };
};

export const updateProjectDispatch = name => {
    return dispatch => {
        let newName = updateProject(name);
        setTimeout(() => {
            dispatch(updateProjectSuccess(newName));
        }, Math.random() * 25);
    };
};

export const createFolderDispatch = (name, parentID) => {
    return dispatch => {
        const folder = createFolder(name);
        setTimeout(() => {
            dispatch(createFolderSuccess(folder, parentID));
        }, Math.random() * 25);
    };
};

export const updateFolderNameDispatch = (folder, name) => {
    return dispatch => {
        const newFolder = updateFolderName(folder, name);
        setTimeout(() => {
            dispatch(updateFolderSuccess(newFolder));
        }, Math.random() * 25);
    };
};

export const deleteFolderDispatch = id => {
    return dispatch => {
        const idToDelete = deleteFolder(id);
        setTimeout(() => {
            dispatch(deleteFolderSuccess(idToDelete));
        }, Math.random() * 25);
    };
};
