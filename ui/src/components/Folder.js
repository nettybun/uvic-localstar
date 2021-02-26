import { useEffect, useState } from "preact/hooks";
import File from "./File";
import { ContextMenu, ContextMenuTrigger, MenuItem } from "preact-context-menu";
import { createFileDispatch } from "../redux/actions/filesActions";
import { useDispatch } from "react-redux";

const Folder = ({ name, content, id, currentHover, setCurrentHover }) => {
    const [isHover, setIsHover] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();

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

    const onCreate = () => {
        console.log("here");
        dispatch(createFileDispatch("newFile37", id));
    };

    return (
        <>
            {id && (
                <>
                    <div
                        onClick={() => {
                            if (isHover) {
                                setIsOpen(state => !state);
                            }
                        }}
                        className={`${
                            isHover ? "bg-gray-500 bg-opacity-10" : ""
                        } p-1  my-1 rounded-md h-auto transition-all`}
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
                            <div className="w-full cursor-pointer h-7 flex">
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
                                <div className="inline-block flex-grow truncate  font-semibold my-auto">
                                    {name}
                                </div>
                            </div>
                        </ContextMenuTrigger>
                        <div
                            className={`pl-4 transform transition-all  origin-top scale-y-0 h-0 opacity-0 ${
                                isOpen ? "scale-y-100 h-auto opacity-100" : ""
                            }`}
                        >
                            {content.map(item => {
                                if (item.type === "file") {
                                    return (
                                        <File
                                            currentHover={currentHover}
                                            setCurrentHover={setCurrentHover}
                                            {...item}
                                            parentID={id}
                                        />
                                    );
                                }
                                return (
                                    <Folder
                                        {...item}
                                        currentHover={currentHover}
                                        setCurrentHover={setCurrentHover}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    <ContextMenu id={`folder-context-${id}`}>
                        <div className="bg-white rounded-md p-1">
                            <MenuItem data={{ foo: "bar" }}>
                                <div
                                    onClick={onCreate}
                                    className="rounded-md px-3 py-1 hover:bg-gray-200 cursor-pointer"
                                >
                                    Create File
                                </div>
                            </MenuItem>
                            <MenuItem data={{ foo: "bar" }}>
                                <div
                                    onClick={() => {}}
                                    className="rounded-md px-3 py-1 my-1 hover:bg-gray-200 cursor-pointer"
                                >
                                    Delete
                                </div>
                            </MenuItem>
                            <MenuItem data={{ foo: "bar" }}>
                                <div
                                    onClick={() => {}}
                                    className="rounded-md px-3 py-1 hover:bg-gray-200 cursor-pointer"
                                >
                                    Rename
                                </div>
                            </MenuItem>
                        </div>
                    </ContextMenu>
                </>
            )}
        </>
    );
};

export default Folder;
