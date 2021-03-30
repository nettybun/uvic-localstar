import { useEffect, useMemo, useState } from "preact/hooks";
import Folder from "./Folder";
import { useDispatch, useSelector } from "react-redux";
import CreateFileModal from "./CreateFileModal";
import CreateFolderModal from "./CreateFolderModal";
import {
    ContextMenu,
    ContextMenuTrigger,
    MenuItem,
    openContextMenu,
} from "preact-context-menu";
import { createPortal } from "preact/compat";
import { makeSelectFiles, makeSelectFolders } from "../services/selectors";
import File from "./File";

const FileNav = () => {
    const fileSystem = useSelector(state => state.project.fileSystem);
    const name = useSelector(state => state.project.name);

    const [currentHover, setCurrentHover] = useState([]);

    const [fileSystemLoaded, setFileSystemLoaded] = useState(false);
    const [showCreateFileModal, setShowCreateFileModal] = useState(false);
    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
    const selectFiles = useMemo(makeSelectFiles, []);
    const selectFolders = useMemo(makeSelectFolders, []);
    const folders = useSelector(state =>
        selectFolders(state, fileSystem ?? [])
    );
    const files = useSelector(state => selectFiles(state, fileSystem ?? []));

    const [container, setContainer] = useState(null);
    useEffect(() => {
        setContainer(document.getElementById("modals"));
    }, []);
    useEffect(() => {
        if (fileSystem && !fileSystemLoaded) {
            setFileSystemLoaded(true);
        }
    }, [fileSystemLoaded, fileSystem]);

    return (
        <div className="flex-grow">
            <ContextMenuTrigger id={`file-nav`}>
                <div className="h-full">
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
                            parentID={null}
                        />
                    ))}
                    <button
                        title="New File/Folder"
                        aria-label="New File/Folder"
                        onClick={() => openContextMenu(`file-nav`)}
                        type="button"
                        className="w-full outline-none focus:outline-none  h-9 p-1  hover:bg-gray-500  hover:bg-opacity-20 transition-all rounded"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="h-5 mx-auto"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                        </svg>
                    </button>
                </div>
            </ContextMenuTrigger>
            <ContextMenu id={`file-nav`}>
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
                            onClick={() => setShowCreateFolderModal(true)}
                            className="rounded-md px-3 py-1 hover:bg-gray-200 cursor-pointer"
                        >
                            Create Folder
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
                            id={null}
                        />,
                        container
                    )}
                    {createPortal(
                        <CreateFolderModal
                            showModal={showCreateFolderModal}
                            setShowModal={setShowCreateFolderModal}
                            id={null}
                        />,
                        container
                    )}
                </>
            )}
        </div>
    );
};

export default FileNav;
