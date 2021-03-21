import { useState, useEffect } from "preact/hooks";
import { h } from "preact";
import { useSelector } from "react-redux";

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [displayMenu, setDisplayMenu] = useState(false);
    const [visibleMenu, setVisibleMenu] = useState(false);
    const isAutoSaving = useSelector(state => state.autoSaving);

    useEffect(() => {
        if (menuOpen) {
            setDisplayMenu(true);
            setTimeout(() => {
                setVisibleMenu(true);
            }, 50);
        } else {
            setVisibleMenu(false);
            setTimeout(() => {
                setDisplayMenu(false);
            }, 150);
        }
    }, [menuOpen]);

    return (
        <header>
            <nav className="bg-gray-800">
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                    <div className="relative flex items-center justify-between h-16">
                        <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                            <button
                                type="button"
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors"
                                aria-controls="mobile-menu"
                                aria-expanded="false"
                            >
                                <span className="sr-only">Open main menu</span>
                                {!menuOpen ? (
                                    <svg
                                        onClick={() => setMenuOpen(true)}
                                        className="block h-6 w-6"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        onClick={() => setMenuOpen(false)}
                                        className="block h-6 w-6"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                )}
                            </button>
                            <div className="text-2xl font-InterBold font-bold text-white ml-2 tracking-wide	">
                                Local
                            </div>
                        </div>
                        <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                            <div className="hidden sm:flex flex-grow  ">
                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                    className="flex-shrink-0 items-center flex hover:bg-gray-700 p-2 rounded-md cursor-pointer transition-colors"
                                >
                                    <svg
                                        className="inline-block fill-current h-8 w-auto text-white"
                                        version="1.1"
                                        viewBox="0 0 31.954 33.005"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                    >
                                        <g transform="translate(-35.386 -36.649)">
                                            <path
                                                transform="scale(.26458)"
                                                d="m190.22 142.29a58.783 58.783 0 0 0-52.697 58.4 58.783 58.783 0 0 0 58.783 58.783 58.783 58.783 0 0 0 54.43-36.678 63.532 63.532 0 0 1-62.902-63.5 63.532 63.532 0 0 1 2.3867-17.006z"
                                            ></path>
                                        </g>
                                    </svg>
                                    <div className="text-2xl font-InterBold font-bold text-white ml-2 tracking-wide	">
                                        Local
                                    </div>
                                </button>
                                {isAutoSaving ? (
                                    <div className="items-center text-gray-300 p-3 ml-10 flex">
                                        <svg
                                            className="inline-block fill-current h-5 w-auto px-2 text-gray-300 animate-spin-backwards"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <div>Saving</div>
                                    </div>
                                ) : (
                                    <div className="items-center text-gray-300 p-3 ml-10 flex">
                                        <svg
                                            className="inline-block fill-current h-5 w-auto px-2 text-gray-300"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <div>Saved</div>
                                    </div>
                                )}
                            </div>
                            <div className=" mx-6 py-2 opacity-20" />
                            <div className="hidden sm:block ">
                                <div className="flex space-x-4 items-center">
                                    <a
                                        href="https://docs.google.com/document/d/1TKgbpxhf1jFz2x_1iKnv-q7FWlXrflTXuiZlgUEOl5E/edit"
                                        className={`text-gray-300 hover:bg-gray-700 hover:text-white p-2 rounded-md text-lg font-InterRegular transition-colors tracking-wide`}
                                    >
                                        Documentation
                                    </a>
                                    <a
                                        aria-label="Github Link"
                                        href="https://github.com/heyheyhello/uvic-localstar"
                                        className={`text-gray-300 hover:bg-gray-700 hover:text-white p-2 rounded-md text-sm font-medium transition-colors`}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            className="fill-current h-8 w-8"
                                        >
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="sm:hidden" id="mobile-menu">
                    <div
                        className={`px-2 pt-2 pb-3 space-y-1 transform transition-all origin-top ${
                            menuOpen ? "block" : "hidden"
                        }`}
                    >
                        <a
                            href="#"
                            className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
                        >
                            About
                        </a>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
