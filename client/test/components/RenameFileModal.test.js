import { render, fireEvent, screen } from "../testUtils";
import { h } from "preact";
import RenameFileModal from "../../src/components/RenameFileModal";

describe("Rename File Modal", () => {
    it("should display correct title", async () => {
        let setShowModal = jest.fn();
        render(
            <RenameFileModal
                showModal={true}
                setShowModal={setShowModal}
                file={{ name: "filename", id: 0 }}
            />
        );
        await screen.findAllByText("Rename File");
    });
    it("should show a create button", async () => {
        let setShowModal = jest.fn();
        render(
            <RenameFileModal
                showModal={true}
                setShowModal={setShowModal}
                file={{ name: "filename", id: 0 }}
            />
        );
        await screen.findByRole("button", { name: "Rename" });
    });
    it("should show a text box", async () => {
        let setShowModal = jest.fn();
        render(
            <RenameFileModal
                showModal={true}
                setShowModal={setShowModal}
                file={{ name: "filename", id: 0 }}
            />
        );
        await screen.findByRole("textbox", {
            name: /File Name/i,
        });
    });
});
