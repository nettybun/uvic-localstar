import { useState, useEffect } from "preact/hooks";
import { useSelector } from "react-redux";
import Modal from "./Modal";
import ProjectTitle from "./ProjectTitle";

const ProjectInfo = () => {
    const project = useSelector(state => state.project);
    const [showModal, setShowModal] = useState(false);

    const [date, setDate] = useState(null);

    useEffect(() => {
        if (project.dateCreated) {
            const d = new Date(2010, 7, 5);
            const ye = new Intl.DateTimeFormat("en", {
                year: "numeric",
            }).format(d);
            const mo = new Intl.DateTimeFormat("en", { month: "short" }).format(
                d
            );
            const da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(
                d
            );
            setDate(`${da}-${mo}-${ye}`);
        }
    }, [project]);

    return (
        <div className="w-full py-3 px-1">
            <ProjectTitle name={project.name} />
            <div>
                <div className="uppercase py-1 font-light text-xs text-gray-500 truncate">
                    Created: {date}
                </div>
                <div className="py-1 font-light text-xs text-gray-500 truncate">
                    <span className="uppercase">Authors:</span>{" "}
                    {project.authors.join(", ")}
                </div>
            </div>
            <hr className="mt-5 px-3  border-gray-600" />
        </div>
    );
};
export default ProjectInfo;
