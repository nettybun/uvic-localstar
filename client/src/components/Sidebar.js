import { useEffect, useState } from "preact/hooks";
import { useDispatch } from "react-redux";
import FileNav from "./FileNav";

import { readProjectDispatch } from "../redux/actions/projectActions";
import ProjectInfo from "./ProjectInfo";

const Sidebar = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(readProjectDispatch());
    }, []);

    return (
        <div className="p-2 min-h-full">
            <div
                // onClick={() => setCounter(state => state + 1)}
                className="text-left h-full w-full outline-none flex flex-col"
            >
                <ProjectInfo />
                <FileNav />
            </div>
        </div>
    );
};

export default Sidebar;
