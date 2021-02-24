import { combineReducers } from "redux";
import apiCallsInProgress from "./apiStatusReducer";
import project from "./projectReducer";
import files from "./filesReducer";
import currentFile from "./currentFileReducer";

const rootReducer = combineReducers({
    project,
    apiCallsInProgress,
    files,
    currentFile,
});

export default rootReducer;
