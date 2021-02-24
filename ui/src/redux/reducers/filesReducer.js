import {
    CREATE_FILE_SUCCESS,
    DELETE_FILE_SUCCESS,
    READ_FILE_SUCCESS,
    UPDATE_FILE_SUCCESS,
} from "../actions/actionTypes";
import initialState from "./initialState";

const filesReducer = (state = initialState.files, action) => {
    switch (action.type) {
        case CREATE_FILE_SUCCESS:
            return {
                ...state,
                [action.file.id]: action.file,
            };
        case READ_FILE_SUCCESS:
            return {
                ...state,
                [action.file.id]: action.file,
            };
        case UPDATE_FILE_SUCCESS:
            return {
                ...state,
                [action.file.id]: action.file,
            };
        case DELETE_FILE_SUCCESS: {
            let newState = { ...state };
            delete newState[action.id];
            return newState;
        }
        default:
            return state;
    }
};

export default filesReducer;
