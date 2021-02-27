import { SELECT_FILE } from "../actions/actionTypes";
import initialState from "./initialState";

const currentFileReducer = (state = initialState.currentFile, action) => {
    switch (action.type) {
        case SELECT_FILE:
            return action.fileName;
        default:
            return state;
    }
};

export default currentFileReducer;
