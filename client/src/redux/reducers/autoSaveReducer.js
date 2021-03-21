import { AUTO_SAVING, UPDATE_FILE_SUCCESS } from "../actions/actionTypes";
import initialState from "./initialState";

const autoSaveReducer = (state = initialState.autoSaving, action) => {
    switch (action.type) {
        case AUTO_SAVING:
            return true;
        case UPDATE_FILE_SUCCESS:
            return false;
        default:
            return state;
    }
};

export default autoSaveReducer;
