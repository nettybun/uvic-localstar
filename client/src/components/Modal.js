import { useEffect, useState } from "preact/hooks";

const Modal = ({ show, children }) => {
    const [visible, setVisible] = useState(false);
    const [display, setDisplay] = useState(false);

    useEffect(() => {
        if (!show) {
            setVisible(false);
            setTimeout(() => {
                setDisplay(false);
            }, 250);
        } else {
            setDisplay(true);
            setTimeout(() => {
                setVisible(true);
            }, 50);
        }
    }, [show]);

    return (
        <div className={!display ? "hidden" : "block"}>
            <div
                className={`h-screen transition-colors w-screen fixed top-0 left-0 bg-black ${
                    visible ? "bg-opacity-40" : "bg-opacity-0"
                } `}
            >
                <div
                    style={{ marginTop: "10%" }}
                    className={` w-1/3 mx-auto bg-white rounded-md shadow-md overflow-hidden ${
                        visible ? "scale-100" : "scale-0"
                    } origin-center transform transition-transform`}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};
export default Modal;
