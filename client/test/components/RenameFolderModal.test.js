import { render, fireEvent, screen } from "../testUtils";
import { h } from "preact";
import RenameFolderModal from "../../src/components/RenameFolderModal";

describe("Rename Folder Modal", () => {
    it("should display correct title", async () => {
        let setShowModal = jest.fn();
        render(
            <RenameFolderModal
                showModal={true}
                setShowModal={setShowModal}
                folder={{ name: "foldername", id: 0 }}
            />
        );
        await screen.findAllByText("Rename Folder");
    });
    it("should show a create button", async () => {
        let setShowModal = jest.fn();
        render(
            <RenameFolderModal
                showModal={true}
                setShowModal={setShowModal}
                folder={{ name: "foldername", id: 0 }}
            />
        );
        await screen.findByRole("button", { name: "Rename" });
    });
    it("should show a text box", async () => {
        let setShowModal = jest.fn();
        render(
            <RenameFolderModal
                showModal={true}
                setShowModal={setShowModal}
                folder={{ name: "foldername", id: 0 }}
            />
        );
        await screen.findByRole("textbox", {
            name: /Folder Name/i,
        });
    });
});
