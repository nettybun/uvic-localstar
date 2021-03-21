import Notebook from "./Notebook";
import Sidebar from "./Sidebar";
import { Provider } from "react-redux";

import configureStore from "../redux/configureStore";
import initalStore from "../redux/reducers/initialState";
import Header from "./Header";

export const store = configureStore(initalStore);

const App = () => {
    return (
        <Provider store={store}>
            <div id="app">
                <div className="flex flex-col h-screen overflow-hidden">
                    <Header />
                    <div className="flex flex-grow">
                        <div
                            style={{ width: 250, height: "calc(100vh - 4rem)" }}
                            className=" bg-gray-200 overflow-auto"
                        >
                            <Sidebar />
                        </div>
                        <div
                            style={{ height: "calc(100vh - 4rem)" }}
                            className="flex-grow bg-gray-100 overflow-auto"
                        >
                            <Notebook />
                        </div>
                    </div>
                </div>
            </div>
            <div id="modals"></div>
        </Provider>
    );
};
export default App;
