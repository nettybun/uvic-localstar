import { combineReducers } from "redux";
import apiCallsInProgress from "./apiStatusReducer";
import project from "./projectReducer";
import files from "./filesReducer";
import currentFile from "./currentFileReducer";
import autoSaving from "./autoSaveReducer";

const rootReducer = combineReducers({
    project,
    apiCallsInProgress,
    files,
    currentFile,
    autoSaving,
});

export default rootReducer;
