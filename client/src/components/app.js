import Notebook from "./Notebook";
import Sidebar from "./Sidebar";
import { Provider } from "react-redux";

import configureStore from "../redux/configureStore";
import initalStore from "../redux/reducers/initialState";

export const store = configureStore(initalStore);

const App = () => {
    return (
        <Provider store={store}>
            <div id="app">
                <div className="flex h-screen">
                    <div className="w-1/5 bg-gray-200">
                        <Sidebar />
                    </div>
                    <div className="w-4/5 bg-gray-100">
                        <Notebook />
                    </div>
                </div>
            </div>
        </Provider>
    );
};
export default App;
