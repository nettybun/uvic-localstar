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
                <div className="flex flex-col h-screen">
                    <Header />
                    <div className="flex flex-grow">
                        <div style={{ width: 250 }} className=" bg-gray-200">
                            <Sidebar />
                        </div>
                        <div className="flex-grow bg-gray-100">
                            <Notebook />
                        </div>
                    </div>
                </div>
            </div>
        </Provider>
    );
};
export default App;
