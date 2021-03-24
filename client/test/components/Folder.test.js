import { render, fireEvent, screen } from "../testUtils";
import { h } from "preact";

jest.mock("preact-context-menu", () => ({
    ContextMenu: ({ children }) => <span>{children}</span>,
    ContextMenuTrigger: ({ children }) => <span>{children}</span>,
    MenuItem: () => <p></p>,
}));
import Folder from "../../src/components/Folder";

describe("Folder", () => {
    it("should display correct name", async () => {
        let setCurrentHover = jest.fn();
        render(
            <Folder
                name="FolderName"
                content={[]}
                id={0}
                currentHover={[]}
                setCurrentHover={setCurrentHover}
            />
        );
        await screen.findAllByText("FolderName");
    });
});
