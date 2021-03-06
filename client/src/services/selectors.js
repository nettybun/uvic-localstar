import { createSelector } from "reselect";

export const makeSelectFolders = () =>
    createSelector(
        (_, content) => content,
        content => content.filter(item => item.type !== "file")
    );

export const makeSelectFiles = () =>
    createSelector(
        (_, content) => content,
        content => content.filter(item => item.type === "file")
    );
