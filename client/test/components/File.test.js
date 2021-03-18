import { render, fireEvent, screen } from "../testUtils";
import { h } from "preact";

jest.mock("preact-context-menu", () => ({
    ContextMenu: ({ children }) => <span>{children}</span>,
    ContextMenuTrigger: ({ children }) => <span>{children}</span>,
    MenuItem: () => <p></p>,
}));
import File from "../../src/components/File";

describe("Folder", () => {
    it("should display correct name", async () => {
        let setCurrentHover = jest.fn();
        render(
            <File
                file={{ name: "fileName", id: "fileName" }}
                currentHover={[]}
                setCurrentHover={setCurrentHover}
            />
        );
        await screen.findByText("fileName");
    });
});
