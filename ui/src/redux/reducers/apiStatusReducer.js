import { BEGIN_API_CALL, API_CALL_ERROR } from "../actions/actionTypes";
import initialState from "./initialState";

const actionTypeEndsInSuccess = type => {
    return type.substring(type.length - 8) === "_SUCCESS";
};

const apiCallStatusReducer = (
    state = initialState.apiCallsInProgress,
    action
) => {
    switch (action.type) {
        case BEGIN_API_CALL:
            return state + 1;
        case API_CALL_ERROR || actionTypeEndsInSuccess(action.type):
            return state === 0 ? 0 : state - 1;
        default:
            return state;
    }
};

export default apiCallStatusReducer;
