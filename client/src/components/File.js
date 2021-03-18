import { useEffect, useState } from "preact/hooks";
import { h, Fragment } from "preact";
import { useDispatch } from "react-redux";
import { ContextMenu, ContextMenuTrigger, MenuItem } from "preact-context-menu";
import { SELECT_FILE } from "../redux/actions/actionTypes";
import { deleteFileDispatch } from "../redux/actions/filesActions";
import RenameFileModal from "./RenameFileModal";
import { createPortal } from "preact/compat";

const File = ({ file, currentHover, setCurrentHover }) => {
    const dispatch = useDispatch();
    const [showRenameFileModal, setShowRenameFileModal] = useState(false);
    const [container, setContainer] = useState(null);

    useEffect(() => {
        setContainer(document.getElementById("modals"));
    }, []);

    const onClick = () => {
        dispatch({ type: SELECT_FILE, fileName: `${file.id}` });
    };

    const onDelete = () => {
        dispatch(deleteFileDispatch(file.id));
    };

    const [, setIsHover] = useState(false);

    useEffect(() => {
        if (currentHover.length > 0) {
            if (currentHover[0] === file.id) {
                setIsHover(true);
            } else {
                setIsHover(false);
            }
        } else {
            setIsHover(false);
        }
    }, [currentHover, file.id]);

    return (
        <>
            <ContextMenuTrigger id={`folder-context-${file.id}`}>
                <div
                    onClick={onClick}
                    onMouseEnter={() =>
                        setCurrentHover(state => [file.id, ...state])
                    }
                    onMouseLeave={() =>
                        setCurrentHover(state =>
                            state.filter(itemID => itemID !== file.id)
                        )
                    }
                    className="w-full py-2 px-1 hover:bg-gray-500 hover:bg-opacity-10 my-1 rounded-md flex cursor-pointer transition-all "
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="h-5 ml-1 mr-2 inline-block flex-shrink-0"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                    </svg>
                    <div className="inline-block align-middle font-medium flex-grow truncate">
                        {file.name}
                    </div>
                </div>
            </ContextMenuTrigger>

            <ContextMenu id={`folder-context-${file.id}`}>
                <div className="bg-white rounded-md p-1 shadow">
                    <MenuItem data={{ foo: "bar" }}>
                        <div
                            onClick={onClick}
                            className="rounded-md px-3 py-1 my-1 hover:bg-gray-200 cursor-pointer"
                        >
                            Open
                        </div>
                    </MenuItem>
                    <MenuItem data={{ foo: "bar" }}>
                        <div
                            onClick={() => {
                                setShowRenameFileModal(true);
                            }}
                            className="rounded-md px-3 py-1 hover:bg-gray-200 cursor-pointer"
                        >
                            Rename
                        </div>
                    </MenuItem>
                    <MenuItem data={{ foo: "bar" }}>
                        <div
                            onClick={onDelete}
                            className="rounded-md px-3 py-1 my-1 hover:bg-gray-200 cursor-pointer"
                        >
                            Delete
                        </div>
                    </MenuItem>
                </div>
            </ContextMenu>
            {container && (
                <>
                    {createPortal(
                        <RenameFileModal
                            showModal={showRenameFileModal}
                            setShowModal={setShowRenameFileModal}
                            file={file}
                        />,
                        container
                    )}
                </>
            )}
        </>
    );
};

export default File;
