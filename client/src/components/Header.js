import { useState, useEffect } from "preact/hooks";

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [displayMenu, setDisplayMenu] = useState(false);
    const [visibleMenu, setVisibleMenu] = useState(false);

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
                        </div>
                        <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                            <div className="flex-shrink-0 flex items-center">
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
                                <div className="text-2xl localTitle font-bold text-white ml-2 tracking-wide	">
                                    Local
                                </div>
                            </div>
                            <div className="border-l mx-6 py-2 opacity-20" />
                            <div className="hidden sm:block ">
                                <div className="flex space-x-4">
                                    <a
                                        href="#"
                                        className={`text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                                    >
                                        About
                                    </a>
                                </div>
                            </div>
                        </div>
                        {/* <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                            <button className="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                                <span className="sr-only">
                                    View notifications
                                </span>
                                <svg
                                    className="h-6 w-6"
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
                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                    />
                                </svg>
                            </button>

                        </div> */}
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
                        {/* <a
                        href="#"
                        className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    >
                        Team
                    </a>
                    <a
                        href="#"
                        className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    >
                        Projects
                    </a>
                    <a
                        href="#"
                        className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    >
                        Calendar
                    </a> */}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
