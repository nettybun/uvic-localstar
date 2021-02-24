import { useEffect, useState } from "preact/hooks";
import Folder from "./Folder";
import { useSelector } from "react-redux";

const FileNav = () => {
    const fileSystem = useSelector(state => state.project.fileSystem);

    const [currentHover, setCurrentHover] = useState([]);

    const [fileSystemLoaded, setFileSystemLoaded] = useState(false);

    useEffect(() => {
        if (fileSystem && !fileSystemLoaded) {
            setFileSystemLoaded(true);
        }
    }, [fileSystemLoaded, fileSystem]);

    return (
        <Folder
            {...fileSystem}
            currentHover={currentHover}
            setCurrentHover={setCurrentHover}
        />
    );
};

export default FileNav;
