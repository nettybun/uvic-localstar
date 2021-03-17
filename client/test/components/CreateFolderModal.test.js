import { render, fireEvent, screen } from "../testUtils";
import { h } from "preact";
import CreateFolderModal from "../../src/components/CreateFolderModal";

describe("Create Folder Modal", () => {
    it("should display correct title", async () => {
        let setShowModal = jest.fn();
        render(
            <CreateFolderModal
                showModal={true}
                setShowModal={setShowModal}
                id={0}
            />
        );
        await screen.findAllByText("Create Folder");
    });
    it("should show a create button", async () => {
        let setShowModal = jest.fn();
        render(
            <CreateFolderModal
                showModal={true}
                setShowModal={setShowModal}
                id={0}
            />
        );
        await screen.findByRole("button", { name: "Create" });
    });
    it("should show a text box", async () => {
        let setShowModal = jest.fn();
        render(
            <CreateFolderModal
                showModal={true}
                setShowModal={setShowModal}
                id={0}
            />
        );
        await screen.findByRole("textbox", {
            name: /Folder Name/i,
        });
    });
});
