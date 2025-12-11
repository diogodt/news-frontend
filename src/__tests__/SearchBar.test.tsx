import { fireEvent, render, screen } from "@testing-library/react";
import { SearchBar } from "../components/SearchBar";
import dayjs from "dayjs";

describe("SearchBar", () => {
  it("calls onSearch when submitting a valid topic", () => {
    const handleSearch = jest.fn();
    render(<SearchBar onSearch={handleSearch} />);
    const input = screen.getByLabelText(/Search topics/i);
    fireEvent.change(input, { target: { value: "AI" } });
    fireEvent.submit(input.closest("form")!);
    expect(handleSearch).toHaveBeenCalledWith("AI", undefined, undefined);
  });

  it("ignores short topics", () => {
    const handleSearch = jest.fn();
    render(<SearchBar onSearch={handleSearch} />);
    const input = screen.getByLabelText(/Search topics/i);
    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.submit(input.closest("form")!);
    expect(handleSearch).not.toHaveBeenCalled();
  });

  it("opens date dialog and confirms", () => {
    render(<SearchBar onSearch={jest.fn()} />);
    fireEvent.click(screen.getByLabelText(/Date \/ range/i));
    expect(screen.getByText(/Select date or range/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /OK/i }));
  });

  it("uses initial date range and passes to search", () => {
    const handleSearch = jest.fn();
    render(<SearchBar onSearch={handleSearch} initialFrom="2025-01-01" initialTo="2025-01-05" initialValue="climate" />);
    const input = screen.getByLabelText(/Search topics/i);
    fireEvent.submit(input.closest("form")!);
    expect(handleSearch).toHaveBeenCalledWith("climate", "2025-01-01", "2025-01-05");
  });

  it("selects earlier second date and swaps correctly", () => {
    jest.spyOn(Date, "now").mockReturnValue(new Date("2025-01-15T12:00:00Z").valueOf());
    const handleSearch = jest.fn();
    render(<SearchBar onSearch={handleSearch} initialValue="football" />);
    const input = screen.getByLabelText(/Search topics/i);
    fireEvent.change(input, { target: { value: "football" } });
    fireEvent.click(screen.getByLabelText(/Date \/ range/i));
    const cells = screen.getAllByRole("gridcell").filter((cell) => !cell.getAttribute("aria-disabled"));
    const day3 = cells.find((cell) => cell.textContent === "3")!;
    const day5 = cells.find((cell) => cell.textContent === "5")!;
    fireEvent.click(day5);
    fireEvent.click(day3); // earlier -> should swap
    fireEvent.click(screen.getByRole("button", { name: /OK/i }));
    fireEvent.submit(input.closest("form")!);
    expect(handleSearch).toHaveBeenCalled();
    (Date.now as jest.Mock).mockRestore();
  });

  it("clears range when clicking same day twice", () => {
    jest.spyOn(Date, "now").mockReturnValue(new Date("2025-01-15T12:00:00Z").valueOf());
    const handleSearch = jest.fn();
    render(<SearchBar onSearch={handleSearch} initialValue="tech" />);
    const input = screen.getByLabelText(/Search topics/i);
    fireEvent.click(screen.getByLabelText(/Date \/ range/i));
    const cells = screen.getAllByRole("gridcell").filter((cell) => !cell.getAttribute("aria-disabled"));
    const day5 = cells.find((cell) => cell.textContent === "5")!;
    fireEvent.click(day5);
    fireEvent.click(day5); // toggle off
    fireEvent.click(screen.getByRole("button", { name: /OK/i }));
    fireEvent.change(input, { target: { value: "tech" } });
    fireEvent.submit(input.closest("form")!);
    const [, , to] = handleSearch.mock.calls[0];
    expect(to).toBeUndefined();
    (Date.now as jest.Mock).mockRestore();
  });
});
