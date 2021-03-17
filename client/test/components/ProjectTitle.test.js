import { render, fireEvent, screen } from "../testUtils";
import { h } from "preact";
import ProjectTitle from "../../src/components/ProjectTitle";

describe("Project Title", () => {
    it("should display name of project", () => {
        const { container } = render(<ProjectTitle name={"Project Name"} />);
        expect(container.textContent).toMatch("Project Name");
    });
    it("should show a text box when double clicked", async () => {
        render(<ProjectTitle name={"Project Name"} />);
        fireEvent.doubleClick(await screen.findByText("Project Name"));
        await screen.findByDisplayValue("Project Name");
    });
    it("should show a text box when icon clicked", async () => {
        render(<ProjectTitle name={"Project Name"} />);
        fireEvent.click(await screen.findByTestId("editButton"));
        await screen.findByDisplayValue("Project Name");
    });
    it("should show an icon to edit", async () => {
        render(<ProjectTitle name={"Project Name"} />);
        await screen.findByTestId("editButton");
    });
});
