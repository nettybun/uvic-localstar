import { useState, useRef, useEffect } from "preact/hooks";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import IframeResizer from "iframe-resizer-react";
import {
    readFileDispatch,
    updateFileDispatch,
} from "../redux/actions/filesActions";

const Notebook = () => {
    // const [notebookContent, setNotebookContent] = useState(initalContent);
    const dispatch = useDispatch();

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
                        type: "RELOAD",
                    });
                }
                setFileIsReady(true);
            } else {
                dispatch(readFileDispatch(currentFileID));
            }
        }
    }, [loadingFile, file, currentFileID, fileIsReady, dispatch]);

    const onMessage = messageData => {
        if (messageData.message.type === "SIGNAL_READY") {
            iframeRef.current.sendMessage({
                type: "SET_NOTEBOOK_CONTENT",
                data: fileRef.current.content,
            });

            // Whenever the notebook content gets changed (e.g. a character is typed)
            // the entire content is sent to the parent website.
        } else if (messageData.message.type === "NOTEBOOK_CONTENT_UPDATE") {
            dispatch(
                updateFileDispatch(fileRef.current, messageData.message.data)
            );

            //     // This signal is sent when a save shortcut (e.g. cmd+s on mac) is pressed.
        } else if (messageData.message.type === "SAVE") {
            // setNotebookContent(messageData.message.data);
        }
    };

    return (
        <div className="w-full h-full p-5">
            {fileIsReady ? (
                <div className="rounded-md p-2 bg-white">
                    <IframeResizer
                        forwardRef={iframeRef}
                        heightCalculationMethod="lowestElement"
                        inPageLinks
                        // onReady={() => {
                        //     setNotebookIsReady(true);
                        // }}
                        onMessage={onMessage}
                        title="Starboard Notebook Sandbox iFrame"
                        id="notebook-iframe"
                        src="https://unpkg.com/starboard-notebook@0.6.0/dist/index.html"
                        // sandbox="allow-scripts allow-modals allow-same-origin allow-pointer-lock allow-top-navigation-by-user-activation allow-forms allow-downloads"
                        checkOrigin={[
                            "http://localhost:8080", // Useful for local development
                            "https://unpkg.com", // Replace with where you are hosting the notebook iframe
                        ]}
                        frameBorder="0"
                        style={{ width: "100%", minWidth: "100%" }}
                    />
                </div>
            ) : (
                <div>Please select a notebook</div>
            )}
        </div>
    );
};

export default Notebook;
