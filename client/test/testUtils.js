// test-utils.js
import { h } from "preact";
import { render as rtlRender } from "@testing-library/preact";
import { Provider } from "react-redux";
import configureStore from "../src/redux/configureStore";
import initalStore from "../src/redux/reducers/initialState";

function render(
    ui,
    { initalStore, store = configureStore(initalStore), ...renderOptions } = {}
) {
    function Wrapper({ children }) {
        return <Provider store={store}>{children}</Provider>;
    }
    return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything
export * from "@testing-library/preact";
// override render method
export { render };
