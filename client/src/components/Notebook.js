import { useState, useRef, useEffect } from "preact/hooks";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { debounce } from "../services/utils";
import IframeResizer from "iframe-resizer-react";
import {
    readFileDispatch,
    updateFileContentDispatch,
} from "../redux/actions/filesActions";
import { AUTO_SAVING } from "../redux/actions/actionTypes";

const Notebook = () => {
    // const [notebookContent, setNotebookContent] = useState(initalContent);
    const dispatch = useDispatch();
    const [isUpdateingFile, setIsUpdateingFile] = useState(false);
    const currentFileID = useSelector(state => state.currentFile);
    const file = useSelector(
        state =>
            state.files[state.currentFile]
                ? state.files[state.currentFile]
                : null,
        shallowEqual
    );
    const [fileIsReady, setFileIsReady] = useState(false);
    // const [notebookIsReady, setNotebookIsReady] = useState(false);
    const fileRef = useRef(file);

    const iframeRef = useRef(null);

    const [loadingFile, setLoadingFile] = useState(false);

    useEffect(() => {
        if (file) fileRef.current = file;
    }, [file]);

    useEffect(() => {
        if (currentFileID !== "") setLoadingFile(true);
    }, [currentFileID]);

    useEffect(() => {
        if (loadingFile) {
            if (file) {
                setLoadingFile(false);
                if (fileIsReady) {
                    iframeRef.current.sendMessage({
                        type: "NOTEBOOK_RELOAD_PAGE",
                    });
                }
                setFileIsReady(true);
            } else {
                dispatch(readFileDispatch(currentFileID));
            }
        }
    }, [loadingFile, file, currentFileID, fileIsReady, dispatch]);

    const updateFile = debounce((file, content) => {
        dispatch(updateFileContentDispatch(file, content));
        setIsUpdateingFile(false);
    }, 500);

    const onMessage = messageData => {
        if (messageData.message.type === "NOTEBOOK_READY_SIGNAL") {
            iframeRef.current.sendMessage({
                type: "NOTEBOOK_SET_INIT_DATA",
                payload: fileRef.current,
            });

            // Whenever the notebook content gets changed (e.g. a character is typed)
            // the entire content is sent to the parent website.
        } else if (messageData.message.type === "NOTEBOOK_CONTENT_UPDATE") {
            // dispatch(
            //     updateFileContentDispatch(
            //         fileRef.current,
            //         messageData.message.payload.content
            //     )
            // );
            setIsUpdateingFile(true);
            dispatch({ type: AUTO_SAVING });
            updateFile(fileRef.current, messageData.message.payload.content);

            //     // This signal is sent when a save shortcut (e.g. cmd+s on mac) is pressed.
        } else if (messageData.message.type === "NOTEBOOK_SAVE_REQUEST") {
            // setNotebookContent(messageData.message.data);
        }
    };

    return (
        <div className="w-full min-h-full p-5">
            {isUpdateingFile}
            {fileIsReady ? (
                <div className="rounded-md p-2 bg-white ">
                    <IframeResizer
                        forwardRef={iframeRef}
                        // heightCalculationMethod="grow"
                        inPageLinks
                        // onReady={() => {
                        //     setNotebookIsReady(true);
                        // }}
                        onMessage={onMessage}
                        title="Starboard Notebook Sandbox iFrame"
                        id="notebook-iframe"
                        src='/starboard-notebook/index.html'
                        frameBorder="0"
                        style={{
                            width: "100%",
                            minWidth: "100%",
                        }}
                        scrolling
                    />
                </div>
            ) : (
                <div>Please select a notebook</div>
            )}
        </div>
    );
};

export default Notebook;
