import { render, fireEvent, screen } from "../testUtils";
import { h } from "preact";
import CreateFileModal from "../../src/components/CreateFileModal";

describe("Create File Modal", () => {
    it("should display correct title", async () => {
        let setShowModal = jest.fn();
        render(
            <CreateFileModal
                showModal={true}
                setShowModal={setShowModal}
                id={0}
            />
        );
        await screen.findAllByText("Create File");
    });
    it("should show a create button", async () => {
        let setShowModal = jest.fn();
        render(
            <CreateFileModal
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
            <CreateFileModal
                showModal={true}
                setShowModal={setShowModal}
                id={0}
            />
        );
        await screen.findByRole("textbox", {
            name: /File Name/i,
        });
    });
});
