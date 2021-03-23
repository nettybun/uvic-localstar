import {
    CREATE_FOLDER_SUCCESS,
    READ_PROJECT_SUCCESS,
    UPDATE_PROJECT_SUCCESS,
    UPDATE_FOLDER_SUCCESS,
    DELETE_FOLDER_SUCCESS,
    READ_FOLDER_SUCCESS,
} from "./actionTypes";
import {
    readProject,
    updateProject,
    createFolder,
    deleteFolder,
    updateFolderName,
    readFolder,
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

const updateFolderSuccess = (folder, oldID) => {
    return {
        type: UPDATE_FOLDER_SUCCESS,
        folder,
        oldID,
    };
};

const deleteFolderSuccess = id => {
    return {
        type: DELETE_FOLDER_SUCCESS,
        id,
    };
};

const readFolderSuccess = (id, fileSystem) => {
    return {
        type: READ_FOLDER_SUCCESS,
        id,
        fileSystem,
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
    return async dispatch => {
        let id = name + "/";
        if (parentID) {
            id = parentID + name + "/";
        }
        const folder = await createFolder({
            id,
            name,
            type: "folder",
            content: [],
        });
        dispatch(createFolderSuccess(folder, parentID));
    };
};

export const updateFolderNameDispatch = (folder, name) => {
    return async dispatch => {
        const newFolder = await updateFolderName(
            { ...folder, id: folder.id.slice(0, -1) },
            name
        );

        dispatch(
            updateFolderSuccess(
                { ...newFolder, id: newFolder.id + "/" },
                folder.id
            )
        );
    };
};

export const deleteFolderDispatch = id => {
    return async dispatch => {
        const idToDelete = await deleteFolder(id);
        dispatch(deleteFolderSuccess(idToDelete));
    };
};

export const readFolderDispatch = id => {
    return async dispatch => {
        const folderFileSystem = await readFolder(id);
        dispatch(readFolderSuccess(id, folderFileSystem));
    };
};
