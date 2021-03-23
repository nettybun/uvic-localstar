import Modal from "./Modal";
import { h } from "preact";
import { updateFileNameDispatch } from "../redux/actions/filesActions";
import { useDispatch } from "react-redux";
import { useState, useEffect } from "preact/hooks";

const RenameFileModal = ({ showModal, setShowModal, file }) => {
    const dispatch = useDispatch();
    const [fileName, setFileName] = useState("");

    const closeModal = () => {
        setFileName("");
        setShowModal(false);
    };

    useEffect(() => {
        setFileName(file.name);
    }, [file.name]);

    const onChange = ({ target }) => {
        setFileName(target.value);
    };

    const onClick = () => {
        dispatch(updateFileNameDispatch(file, fileName));
        setShowModal(false);
    };

    return (
        <Modal show={showModal}>
            <div className="p-5">
                <div
                    onClick={closeModal}
                    className="absolute top-0 right-0 p-2 m-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="h-5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </div>
                <div class="font-bold text-3xl py-3">Rename File</div>
                <div class="flex w-full sm:flex-row flex-col mx-auto px-8 sm:space-x-4 sm:space-y-0 space-y-4 sm:px-0 items-end">
                    <div class="relative flex-grow w-full">
                        <label
                            for={`newFileName${file.id}`}
                            class="leading-7 text-sm text-gray-600"
                        >
                            File Name
                        </label>
                        <input
                            type="text"
                            id={`newFileName${file.id}`}
                            name={`newFileName${file.id}`}
                            value={fileName}
                            onInput={onChange}
                            class="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-transparent focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={onClick}
                        class="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 transition-colors rounded text-lg"
                    >
                        Rename
                    </button>
                </div>
            </div>
        </Modal>
    );
};
export default RenameFileModal;
