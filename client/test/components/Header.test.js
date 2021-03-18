import { render, fireEvent, screen } from "../testUtils";
import { h } from "preact";
import Header from "../../src/components/Header";

describe("Header", () => {
    it("should display app title", async () => {
        render(<Header />);
        await screen.findByRole("button", { name: "Local" });
    });
    it("should display link to documentation", async () => {
        render(<Header />);
        await screen.findByRole("link", { name: "Documentation" });
    });
    it("should display link to github repo", async () => {
        render(<Header />);
        await screen.findByRole("link", { name: "Github Link" });
    });
});
