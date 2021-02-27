import { READ_PROJECT_SUCCESS } from "./actionTypes";
import { readProject } from "../../services/api";

const readProjectSuccess = project => {
    return {
        type: READ_PROJECT_SUCCESS,
        project,
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
