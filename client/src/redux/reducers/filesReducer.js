import {
    CREATE_FILE_SUCCESS,
    DELETE_FILE_SUCCESS,
    READ_FILE_SUCCESS,
    UPDATE_FILE_NAME_SUCCESS,
    UPDATE_FILE_SUCCESS,
} from "../actions/actionTypes";
import initialState from "./initialState";

const filesReducer = (state = initialState.files, action) => {
    switch (action.type) {
        case CREATE_FILE_SUCCESS:
            return {
                ...state,
                [action.item.id]: action.item,
            };
        case READ_FILE_SUCCESS: {
            let matches = action.file.id.match(/[^/]+$/g);

            let name;
            if (matches) {
                name = matches[0];
            }
            return {
                ...state,
                [action.file.id]: {
                    ...action.file,
                    name,
                },
            };
        }
        case UPDATE_FILE_NAME_SUCCESS: {
            let oldFile = state[action.oldID];

            let oldState = state;

            delete oldState[action.oldID];
            return {
                ...oldState,
                [action.file.id]: { ...oldFile, ...action.file },
            };
        }
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
