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
        <div>
            <Folder
                {...fileSystem}
                currentHover={currentHover}
                setCurrentHover={setCurrentHover}
            />
        </div>
    );
};

export default FileNav;
