import { render, screen } from "@testing-library/react";
import { Loader, FullScreenLoader } from "../components/Loader";

describe("Loader components", () => {
  it("renders Loader", () => {
    render(<Loader label="Loading" />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it("renders FullScreenLoader", () => {
    render(<FullScreenLoader label="Wait" />);
    expect(screen.getByText(/Wait/i)).toBeInTheDocument();
  });
});
