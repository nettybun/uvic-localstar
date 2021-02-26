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
        <div className="p-2 ">
            <div
                // onClick={() => setCounter(state => state + 1)}
                className="text-left w-full outline-none"
            >
                <ProjectInfo />
                <FileNav />
            </div>
        </div>
    );
};

export default Sidebar;
