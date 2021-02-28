import { READ_PROJECT_SUCCESS, UPDATE_PROJECT_SUCCESS } from "./actionTypes";
import { readProject, updateProject } from "../../services/api";

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

export const readProjectDispatch = () => {
    return dispatch => {
        let project = readProject();
        setTimeout(() => {
            dispatch(readProjectSuccess(project));
        }, Math.random() * 25);
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
