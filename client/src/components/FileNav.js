import { useEffect, useMemo, useState } from "preact/hooks";
import Folder from "./Folder";
import { useDispatch, useSelector } from "react-redux";
import CreateFileModal from "./CreateFileModal";
import CreateFolderModal from "./CreateFolderModal";
import { ContextMenu, ContextMenuTrigger, MenuItem } from "preact-context-menu";
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
