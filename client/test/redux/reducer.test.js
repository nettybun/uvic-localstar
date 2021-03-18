import filesReducer from "../../src/redux/reducers/filesReducer";
import projectReducer from "../../src/redux/reducers/projectReducer";
import currentFileReducer from "../../src/redux/reducers/currentFileReducer";
import {
    CREATE_FILE_SUCCESS,
    CREATE_FOLDER_SUCCESS,
    DELETE_FILE_SUCCESS,
    DELETE_FOLDER_SUCCESS,
    READ_FILE_SUCCESS,
    READ_PROJECT_SUCCESS,
    SELECT_FILE,
    UPDATE_FILE_SUCCESS,
    UPDATE_FOLDER_SUCCESS,
    UPDATE_PROJECT_SUCCESS,
} from "../../src/redux/actions/actionTypes";
import initialState from "../../src/redux/reducers/initialState";
import { project } from "../../src/services/objects";

describe("files reducer", () => {
    it("should return the initial state", () => {
        expect(filesReducer(undefined, {})).toEqual(initialState.files);
    });

    it("should handle CREATE_FILE_SUCCESS", () => {
        //add file to list

        expect(
            filesReducer(
                {},
                {
                    type: CREATE_FILE_SUCCESS,
                    item: {
                        id: 0,
                        name: "file0",
                        type: "file",
                        content: ``,
                    },
                    parentID: null,
                }
            )
        ).toEqual({
            0: {
                id: 0,
                name: "file0",
                type: "file",
                content: ``,
            },
        });
        //add file to list where other files exist
        expect(
            filesReducer(
                {
                    1: {
                        id: 1,
                        name: "file1",
                        type: "file",
                        content: ``,
                    },
                },
                {
                    type: CREATE_FILE_SUCCESS,
                    item: {
                        id: 0,
                        name: "file0",
                        type: "file",
                        content: ``,
                    },
                    parentID: null,
                }
            )
        ).toEqual({
            0: {
                id: 0,
                name: "file0",
                type: "file",
                content: ``,
            },
            1: {
                id: 1,
                name: "file1",
                type: "file",
                content: ``,
            },
        });
    });

    it("should handle READ_FILE_SUCCESS", () => {
        //add file to list
        expect(
            filesReducer(
                {
                    1: {
                        id: 1,
                        name: "file1",
                        type: "file",
                        content: ``,
                    },
                },
                {
                    type: READ_FILE_SUCCESS,
                    file: {
                        id: 0,
                        name: "file0",
                        type: "file",
                        content: ``,
                    },
                    parentID: null,
                }
            )
        ).toEqual({
            0: {
                id: 0,
                name: "file0",
                type: "file",
                content: ``,
            },
            1: {
                id: 1,
                name: "file1",
                type: "file",
                content: ``,
            },
        });
    });

    it("should handle UPDATE_FILE_SUCCESS", () => {
        //overwrite file
        expect(
            filesReducer(
                {
                    0: {
                        id: 0,
                        name: "file0",
                        type: "filename",
                        content: ``,
                    },
                    1: {
                        id: 1,
                        name: "file1",
                        type: "file",
                        content: ``,
                    },
                },
                {
                    type: UPDATE_FILE_SUCCESS,
                    file: {
                        id: 0,
                        name: "file0",
                        type: "file",
                        content: ``,
                    },
                    parentID: null,
                }
            )
        ).toEqual({
            0: {
                id: 0,
                name: "file0",
                type: "file",
                content: ``,
            },
            1: {
                id: 1,
                name: "file1",
                type: "file",
                content: ``,
            },
        });
    });
    it("should handle UPDATE_FILE_SUCCESS", () => {
        //Delete a file
        expect(
            filesReducer(
                {
                    0: {
                        id: 0,
                        name: "file0",
                        type: "file",
                        content: ``,
                    },
                    1: {
                        id: 1,
                        name: "file1",
                        type: "file",
                        content: ``,
                    },
                },
                {
                    type: DELETE_FILE_SUCCESS,
                    id: 1,
                }
            )
        ).toEqual({
            0: {
                id: 0,
                name: "file0",
                type: "file",
                content: ``,
            },
        });
    });
});

describe("project reducer", () => {
    it("should return the initial state", () => {
        expect(projectReducer(undefined, {})).toEqual(initialState.project);
    });
    it("should handle READ_PROJECT_SUCCESS", () => {
        //Read project
        expect(
            projectReducer(initialState.project, {
                type: READ_PROJECT_SUCCESS,
                project: {
                    ...project,
                    fileSystem: [
                        {
                            name: "folder/",
                            size: "",
                        },
                        {
                            name: "file",
                            size: 789,
                        },
                    ],
                },
            })
        ).toEqual({
            ...project,
            fileSystem: [
                {
                    name: "folder",
                    type: "folder",
                    id: "folder/",
                    content: [],
                },
                {
                    name: "file",
                    id: "file",
                    type: "file",
                },
            ],
        });
    });
    it("should handle DELETE_FILE_SUCCESS", () => {
        //Delete nested file
        expect(
            projectReducer(project, {
                type: DELETE_FILE_SUCCESS,
                id: 0,
            })
        ).toEqual({
            name: "SENG499",
            authors: ["Dylan", "Michelle", "Grant"],
            dateCreated: project.dateCreated,
            fileSystem: [
                {
                    name: "home",
                    type: "folder",
                    id: 4,
                    content: [
                        {
                            id: 1,
                            name: "file2",
                            type: "file",
                        },
                        {
                            name: "work",
                            type: "folder",
                            id: 2,
                            content: [
                                {
                                    id: 3,
                                    name: "workfile1",
                                    type: "file",
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        //Delete top level file
        expect(
            projectReducer(
                {
                    name: "SENG499",
                    authors: ["Dylan", "Michelle", "Grant"],
                    dateCreated: null,
                    fileSystem: [
                        {
                            name: "home",
                            type: "folder",
                            id: 4,
                            content: [
                                {
                                    id: 0,
                                    name: "file1",
                                    type: "file",
                                },
                                {
                                    id: 1,
                                    name: "file2",
                                    type: "file",
                                },
                                {
                                    name: "work",
                                    type: "folder",
                                    id: 2,
                                    content: [
                                        {
                                            id: 3,
                                            name: "workfile1",
                                            type: "file",
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            id: 5,
                            name: "file2",
                            type: "file",
                        },
                    ],
                },
                {
                    type: DELETE_FILE_SUCCESS,
                    id: 5,
                }
            )
        ).toEqual({
            name: "SENG499",
            authors: ["Dylan", "Michelle", "Grant"],
            dateCreated: null,
            fileSystem: [
                {
                    name: "home",
                    type: "folder",
                    id: 4,
                    content: [
                        {
                            id: 0,
                            name: "file1",
                            type: "file",
                        },
                        {
                            id: 1,
                            name: "file2",
                            type: "file",
                        },
                        {
                            name: "work",
                            type: "folder",
                            id: 2,
                            content: [
                                {
                                    id: 3,
                                    name: "workfile1",
                                    type: "file",
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });
    it("should handle DELETE_FOLDER_SUCCESS", () => {
        //delete nested folder
        expect(
            projectReducer(project, {
                type: DELETE_FOLDER_SUCCESS,
                id: 2,
            })
        ).toEqual({
            name: "SENG499",
            authors: ["Dylan", "Michelle", "Grant"],
            dateCreated: project.dateCreated,
            fileSystem: [
                {
                    name: "home",
                    type: "folder",
                    id: 4,
                    content: [
                        {
                            id: 0,
                            name: "file1",
                            type: "file",
                        },
                        {
                            id: 1,
                            name: "file2",
                            type: "file",
                        },
                    ],
                },
            ],
        });
        //Delete top level folder
        expect(
            projectReducer(
                {
                    name: "SENG499",
                    authors: ["Dylan", "Michelle", "Grant"],
                    dateCreated: project.dateCreated,
                    fileSystem: [
                        {
                            name: "home",
                            type: "folder",
                            id: 4,
                            content: [
                                {
                                    id: 0,
                                    name: "file1",
                                    type: "file",
                                },
                                {
                                    id: 1,
                                    name: "file2",
                                    type: "file",
                                },
                            ],
                        },
                        {
                            id: 5,
                            name: "file1",
                            type: "file",
                        },
                    ],
                },
                {
                    type: DELETE_FOLDER_SUCCESS,
                    id: 4,
                }
            )
        ).toEqual({
            name: "SENG499",
            authors: ["Dylan", "Michelle", "Grant"],
            dateCreated: project.dateCreated,
            fileSystem: [
                {
                    id: 5,
                    name: "file1",
                    type: "file",
                },
            ],
        });
    });
    it("should handle CREATE_FOLDER_SUCCESS", () => {
        //Create folder nested
        expect(
            projectReducer(project, {
                type: CREATE_FOLDER_SUCCESS,
                parentID: 4,
                item: {
                    name: "home",
                    type: "folder",
                    id: 32,
                    content: [],
                },
            })
        ).toEqual({
            name: "SENG499",
            authors: ["Dylan", "Michelle", "Grant"],
            dateCreated: project.dateCreated,
            fileSystem: [
                {
                    name: "home",
                    type: "folder",
                    id: 4,
                    content: [
                        {
                            id: 0,
                            name: "file1",
                            type: "file",
                        },
                        {
                            id: 1,
                            name: "file2",
                            type: "file",
                        },
                        {
                            name: "work",
                            type: "folder",
                            id: 2,
                            content: [
                                {
                                    id: 3,
                                    name: "workfile1",
                                    type: "file",
                                },
                            ],
                        },
                        {
                            name: "home",
                            type: "folder",
                            id: 32,
                            content: [],
                        },
                    ],
                },
            ],
        });
        //create folder root
        expect(
            projectReducer(project, {
                type: CREATE_FOLDER_SUCCESS,
                parentID: null,
                item: {
                    name: "home",
                    type: "folder",
                    id: 32,
                    content: [],
                },
            })
        ).toEqual({
            name: "SENG499",
            authors: ["Dylan", "Michelle", "Grant"],
            dateCreated: project.dateCreated,
            fileSystem: [
                {
                    name: "home",
                    type: "folder",
                    id: 4,
                    content: [
                        {
                            id: 0,
                            name: "file1",
                            type: "file",
                        },
                        {
                            id: 1,
                            name: "file2",
                            type: "file",
                        },
                        {
                            name: "work",
                            type: "folder",
                            id: 2,
                            content: [
                                {
                                    id: 3,
                                    name: "workfile1",
                                    type: "file",
                                },
                            ],
                        },
                    ],
                },
                {
                    name: "home",
                    type: "folder",
                    id: 32,
                    content: [],
                },
            ],
        });
    });
    it("should handle CREATE_FILE_SUCCESS", () => {
        //Create folder nested
        expect(
            projectReducer(project, {
                type: CREATE_FILE_SUCCESS,
                parentID: 4,
                item: {
                    id: 32,
                    name: "file1",
                    type: "file",
                },
            })
        ).toEqual({
            name: "SENG499",
            authors: ["Dylan", "Michelle", "Grant"],
            dateCreated: project.dateCreated,
            fileSystem: [
                {
                    name: "home",
                    type: "folder",
                    id: 4,
                    content: [
                        {
                            id: 0,
                            name: "file1",
                            type: "file",
                        },
                        {
                            id: 1,
                            name: "file2",
                            type: "file",
                        },
                        {
                            name: "work",
                            type: "folder",
                            id: 2,
                            content: [
                                {
                                    id: 3,
                                    name: "workfile1",
                                    type: "file",
                                },
                            ],
                        },
                        {
                            id: 32,
                            name: "file1",
                            type: "file",
                        },
                    ],
                },
            ],
        });
        //create folder root
        expect(
            projectReducer(project, {
                type: CREATE_FILE_SUCCESS,
                parentID: null,
                item: {
                    id: 32,
                    name: "file1",
                    type: "file",
                },
            })
        ).toEqual({
            name: "SENG499",
            authors: ["Dylan", "Michelle", "Grant"],
            dateCreated: project.dateCreated,
            fileSystem: [
                {
                    name: "home",
                    type: "folder",
                    id: 4,
                    content: [
                        {
                            id: 0,
                            name: "file1",
                            type: "file",
                        },
                        {
                            id: 1,
                            name: "file2",
                            type: "file",
                        },
                        {
                            name: "work",
                            type: "folder",
                            id: 2,
                            content: [
                                {
                                    id: 3,
                                    name: "workfile1",
                                    type: "file",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: 32,
                    name: "file1",
                    type: "file",
                },
            ],
        });
    });
    it("should handle UPDATE_PROJECT_SUCCESS", () => {
        //update project name
        expect(
            projectReducer(project, {
                type: UPDATE_PROJECT_SUCCESS,
                name: "new name",
            })
        ).toEqual({ ...project, name: "new name" });
    });
    it("should handle UPDATE_FILE_SUCCESS", () => {
        //update file nested
        expect(
            projectReducer(project, {
                type: UPDATE_FILE_SUCCESS,
                file: {
                    id: 0,
                    name: "new file name",
                    type: "file",
                },
            })
        ).toEqual({
            name: "SENG499",
            authors: ["Dylan", "Michelle", "Grant"],
            dateCreated: project.dateCreated,
            fileSystem: [
                {
                    name: "home",
                    type: "folder",
                    id: 4,
                    content: [
                        {
                            id: 0,
                            name: "new file name",
                            type: "file",
                        },
                        {
                            id: 1,
                            name: "file2",
                            type: "file",
                        },
                        {
                            name: "work",
                            type: "folder",
                            id: 2,
                            content: [
                                {
                                    id: 3,
                                    name: "workfile1",
                                    type: "file",
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        //update file in root
        expect(
            projectReducer(
                {
                    name: "SENG499",
                    authors: ["Dylan", "Michelle", "Grant"],
                    dateCreated: project.dateCreated,
                    fileSystem: [
                        {
                            name: "home",
                            type: "folder",
                            id: 4,
                            content: [
                                {
                                    id: 0,
                                    name: "file1",
                                    type: "file",
                                },
                                {
                                    id: 1,
                                    name: "file2",
                                    type: "file",
                                },
                                {
                                    name: "work",
                                    type: "folder",
                                    id: 2,
                                    content: [
                                        {
                                            id: 3,
                                            name: "workfile1",
                                            type: "file",
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            id: 32,
                            name: "old file name",
                            type: "file",
                        },
                    ],
                },
                {
                    type: UPDATE_FILE_SUCCESS,
                    file: {
                        id: 32,
                        name: "new file name",
                        type: "file",
                    },
                }
            )
        ).toEqual({
            name: "SENG499",
            authors: ["Dylan", "Michelle", "Grant"],
            dateCreated: project.dateCreated,
            fileSystem: [
                {
                    name: "home",
                    type: "folder",
                    id: 4,
                    content: [
                        {
                            id: 0,
                            name: "file1",
                            type: "file",
                        },
                        {
                            id: 1,
                            name: "file2",
                            type: "file",
                        },
                        {
                            name: "work",
                            type: "folder",
                            id: 2,
                            content: [
                                {
                                    id: 3,
                                    name: "workfile1",
                                    type: "file",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: 32,
                    name: "new file name",
                    type: "file",
                },
            ],
        });
    });
    it("should handle UPDATE_FOLDER_SUCCESS", () => {
        //update folder
        expect(
            projectReducer(project, {
                type: UPDATE_FOLDER_SUCCESS,
                folder: {
                    id: 4,
                    name: "new folder name",
                    type: "folder",
                },
            })
        ).toEqual({
            name: "SENG499",
            authors: ["Dylan", "Michelle", "Grant"],
            dateCreated: project.dateCreated,
            fileSystem: [
                {
                    id: 4,
                    name: "new folder name",
                    type: "folder",
                    content: [
                        {
                            id: 0,
                            name: "file1",
                            type: "file",
                        },
                        {
                            id: 1,
                            name: "file2",
                            type: "file",
                        },
                        {
                            name: "work",
                            type: "folder",
                            id: 2,
                            content: [
                                {
                                    id: 3,
                                    name: "workfile1",
                                    type: "file",
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        //update folder nested
        expect(
            projectReducer(project, {
                type: UPDATE_FOLDER_SUCCESS,
                folder: {
                    id: 2,
                    name: "new folder name",
                    type: "folder",
                },
            })
        ).toEqual({
            name: "SENG499",
            authors: ["Dylan", "Michelle", "Grant"],
            dateCreated: project.dateCreated,
            fileSystem: [
                {
                    name: "home",
                    type: "folder",
                    id: 4,
                    content: [
                        {
                            id: 0,
                            name: "file1",
                            type: "file",
                        },
                        {
                            id: 1,
                            name: "file2",
                            type: "file",
                        },
                        {
                            id: 2,
                            name: "new folder name",
                            type: "folder",
                            content: [
                                {
                                    id: 3,
                                    name: "workfile1",
                                    type: "file",
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });
});

describe("current file reducer", () => {
    it("should return the initial state", () => {
        expect(currentFileReducer(undefined, {})).toEqual(
            initialState.currentFile
        );
    });
    it("should handle SELECT_FILE", () => {
        //from initial
        expect(
            currentFileReducer(initialState.currentFile, {
                type: SELECT_FILE,
                fileName: "1",
            })
        ).toEqual("1");
        //from set
        expect(
            currentFileReducer("1", {
                type: SELECT_FILE,
                fileName: "2",
            })
        ).toEqual("2");
    });
});
