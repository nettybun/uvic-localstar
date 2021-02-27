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
            {/* <Modal show={showModal}>
                <div>
                    <div className="">
                        <div className="mt-5 md:mt-0 md:col-span-2">
                            <form action="#">
                                <div className=" sm:rounded-md">
                                    <div className="px-4 py-5 bg-white sm:p-6">
                                        <div className="grid grid-cols-6 gap-6">
                                            <div className="col-span-6 sm:col-span-4">
                                                <label
                                                    for="project_name"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Project Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="project_name"
                                                    id="project_name"
                                                    value={project.name}
                                                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md transition-colors"
                                                />
                                            </div>

                                            <div className="col-span-6 sm:col-span-4">
                                                <label
                                                    for="email_address"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Email address
                                                </label>
                                                <input
                                                    type="text"
                                                    name="email_address"
                                                    id="email_address"
                                                    autocomplete="email"
                                                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>

                                            <div className="col-span-6 sm:col-span-3">
                                                <label
                                                    for="country"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Country / Region
                                                </label>
                                                <select
                                                    id="country"
                                                    name="country"
                                                    autocomplete="country"
                                                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                >
                                                    <option>
                                                        United States
                                                    </option>
                                                    <option>Canada</option>
                                                    <option>Mexico</option>
                                                </select>
                                            </div>

                                            <div className="col-span-6">
                                                <label
                                                    for="street_address"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Street address
                                                </label>
                                                <input
                                                    type="text"
                                                    name="street_address"
                                                    id="street_address"
                                                    autocomplete="street-address"
                                                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>

                                            <div className="col-span-6 sm:col-span-6 lg:col-span-2">
                                                <label
                                                    for="city"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    City
                                                </label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    id="city"
                                                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>

                                            <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                                                <label
                                                    for="state"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    State / Province
                                                </label>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    id="state"
                                                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>

                                            <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                                                <label
                                                    for="postal_code"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    ZIP / Postal
                                                </label>
                                                <input
                                                    type="text"
                                                    name="postal_code"
                                                    id="postal_code"
                                                    autocomplete="postal-code"
                                                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                                        <button
                                            type="submit"
                                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </Modal> */}
        </div>
    );
};
export default ProjectInfo;
