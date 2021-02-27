import { useEffect, useState } from "preact/hooks";
import { useDispatch } from "react-redux";
import { updateProjectDispatch } from "../redux/actions/projectActions";

const ProjectTitle = ({ name }) => {
    const [edit, setEdit] = useState(false);
    const [changed, setChanged] = useState(false);
    const [value, setValue] = useState(name);
    const dispatch = useDispatch();

    useEffect(() => {
        setValue(name);
    }, [name]);

    const saveName = () => {
        dispatch(updateProjectDispatch(value));
        setEdit(false);
        setChanged(false);
    };

    const onChange = ({ target }) => {
        setValue(target.value);
        if (!changed) setChanged(true);
    };

    const handleIconClick = () => {
        if (!edit) setEdit(true);
        else if (!changed) setEdit(false);
        else saveName();
    };

    return (
        <div className=" py-1 flex">
            {!edit ? (
                <div
                    onDoubleClick={() => setEdit(true)}
                    className="font-bold text-3xl"
                >
                    {name}
                </div>
            ) : (
                <div className="">
                    <input
                        type="text"
                        name="project_name"
                        id="project_name"
                        value={value}
                        onChange={onChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md transition-colors"
                    />
                </div>
            )}

            <div
                onClick={handleIconClick}
                className={`inline-block my-auto p-1 hover:bg-gray-300 ${
                    edit ? "text-gray-600" : "text-gray-400"
                } hover:text-gray-800 mx-2 rounded-md cursor-pointer z-50`}
            >
                {!edit ? (
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
                ) : changed ? (
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
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                ) : (
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
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                )}
            </div>
        </div>
    );
};

export default ProjectTitle;
