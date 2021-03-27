import { useEffect, useMemo, useState } from "preact/hooks";
import File from "./File";
import {
    ContextMenu,
    ContextMenuTrigger,
    MenuItem,
    openContextMenu,
} from "preact-context-menu";
import { useDispatch, useSelector } from "react-redux";
import CreateFileModal from "./CreateFileModal";
import { createPortal } from "preact/compat";
import { makeSelectFolders, makeSelectFiles } from "../services/selectors";
import CreateFolderModal from "./CreateFolderModal";
import RenameFolderModal from "./RenameFolderModal";
import {
    deleteFolderDispatch,
    readFolderDispatch,
} from "../redux/actions/projectActions";
import { h, Fragment } from "preact";

const Folder = ({ name, content, id, currentHover, setCurrentHover }) => {
    const [isHover, setIsHover] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();
    const [showCreateFileModal, setShowCreateFileModal] = useState(false);
    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
    const [showUpdateFolderModal, setShowUpdateFolderModal] = useState(false);
    const [container, setContainer] = useState(null);

    const selectFiles = useMemo(makeSelectFiles, []);
    const selectFolders = useMemo(makeSelectFolders, []);
    const folders = useSelector(state => selectFolders(state, content ?? []));
    const files = useSelector(state => selectFiles(state, content ?? []));
    const [isButtonHover, setIsButtonHover] = useState(false);

    useEffect(() => {
        setContainer(document.getElementById("modals"));
    }, []);

    useEffect(() => {
        if (currentHover.length > 0) {
            if (currentHover[0] === id) {
                setIsHover(true);
            } else {
                setIsHover(false);
            }
        } else {
            setIsHover(false);
        }
    }, [currentHover, id]);

    const onFolderClick = () => {
        if (isHover && !isButtonHover) {
            dispatch(readFolderDispatch(id));
            setIsOpen(state => !state);
        }
    };

    return (
        <>
            {
                <>
                    <div
                        className={`${
                            isHover ? "bg-gray-500 bg-opacity-10" : ""
                        } p-1  my-1 rounded-md transition-all`}
                        onMouseEnter={() =>
                            setCurrentHover(state => [id, ...state])
                        }
                        onMouseLeave={() =>
                            setCurrentHover(state =>
                                state.filter(itemID => itemID !== id)
                            )
                        }
                    >
                        <ContextMenuTrigger id={`folder-context-${id}`}>
                            <div
                                className="w-full cursor-pointer h-7 flex"
                                onClick={onFolderClick}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    className={`h-5 inline-block transform transition-transform flex-shrink-0 my-auto ${
                                        isOpen ? " rotate-90" : ""
                                    }`}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    className="h-5 ml-1 mr-2 inline-block flex-shrink-0 my-auto"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                    />
                                </svg>
                                <div className="inline-block flex-grow text-sm truncate  my-auto">
                                    {name}
                                </div>
                                <button
                                    title="Folder Options"
                                    aria-label="Folder Options"
                                    onMouseEnter={() => setIsButtonHover(true)}
                                    onMouseLeave={() => setIsButtonHover(false)}
                                    onClick={() =>
                                        openContextMenu(`folder-context-${id}`)
                                    }
                                    type="button"
                                    className="p-1 focus:outline-none rounded hover:bg-gray-500 hover:bg-opacity-10"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        className="h-5 "
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </ContextMenuTrigger>
                        <div
                            className={`pl-4 transform transition-all  origin-top scale-y-0 h-0 opacity-0 ${
                                isOpen ? "scale-y-100 h-auto opacity-100" : ""
                            }`}
                        >
                            {folders.map(item => (
                                <Folder
                                    {...item}
                                    currentHover={currentHover}
                                    setCurrentHover={setCurrentHover}
                                />
                            ))}
                            {files.map(item => (
                                <File
                                    currentHover={currentHover}
                                    setCurrentHover={setCurrentHover}
                                    file={item}
                                    parentID={id}
                                />
                            ))}
                        </div>
                    </div>

                    <ContextMenu id={`folder-context-${id}`}>
                        <div className="bg-white rounded-md p-1 shadow">
                            <MenuItem data={{ foo: "bar" }}>
                                <div
                                    onClick={() => setShowCreateFileModal(true)}
                                    className="rounded-md px-3 py-1 hover:bg-gray-200 cursor-pointer"
                                >
                                    Create File
                                </div>
                            </MenuItem>
                            <MenuItem data={{ foo: "bar" }}>
                                <div
                                    onClick={() =>
                                        setShowCreateFolderModal(true)
                                    }
                                    className="rounded-md px-3 py-1 hover:bg-gray-200 cursor-pointer"
                                >
                                    Create Folder
                                </div>
                            </MenuItem>
                            <MenuItem data={{ foo: "bar" }}>
                                <div
                                    onClick={() =>
                                        dispatch(deleteFolderDispatch(id))
                                    }
                                    className="rounded-md px-3 py-1 my-1 hover:bg-gray-200 cursor-pointer"
                                >
                                    Delete
                                </div>
                            </MenuItem>
                            <MenuItem data={{ foo: "bar" }}>
                                <div
                                    onClick={() =>
                                        setShowUpdateFolderModal(true)
                                    }
                                    className="rounded-md px-3 py-1 hover:bg-gray-200 cursor-pointer"
                                >
                                    Rename
                                </div>
                            </MenuItem>
                        </div>
                    </ContextMenu>
                    {container && (
                        <>
                            {createPortal(
                                <CreateFileModal
                                    showModal={showCreateFileModal}
                                    setShowModal={setShowCreateFileModal}
                                    id={id}
                                />,
                                container
                            )}
                            {createPortal(
                                <CreateFolderModal
                                    showModal={showCreateFolderModal}
                                    setShowModal={setShowCreateFolderModal}
                                    id={id}
                                />,
                                container
                            )}
                            {createPortal(
                                <RenameFolderModal
                                    showModal={showUpdateFolderModal}
                                    setShowModal={setShowUpdateFolderModal}
                                    folder={{
                                        name,
                                        id,
                                        type: "folder",
                                    }}
                                />,
                                container
                            )}
                        </>
                    )}
                </>
            }
        </>
    );
};

export default Folder;
