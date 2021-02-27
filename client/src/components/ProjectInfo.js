import { useState, useEffect } from "preact/hooks";
import { useSelector } from "react-redux";

const ProjectInfo = () => {
    const project = useSelector(state => state.project);

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
            <div className=" py-1 flex">
                <div className="font-bold text-3xl">{project.name}</div>
                <div className="inline-block my-auto p-1 hover:bg-gray-300 text-gray-400 hover:text-gray-800 mx-2 rounded-md cursor-pointer">
                    <svg
                        className="h-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                    </svg>
                </div>
            </div>
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
