import { fireEvent, render, screen } from "@testing-library/react";
import { ArticleCard } from "../components/ArticleCard";

const baseArticle = {
  url: "http://example.com",
  title: "Title",
  description: "Desc",
  source: "Src",
  publishedAt: "2024-01-01",
};

describe("ArticleCard", () => {
  it("triggers onOpen when clicking title", () => {
    const onOpen = jest.fn();
    render(<ArticleCard article={baseArticle} onOpen={onOpen} />);
    fireEvent.click(screen.getByText("Title"));
    expect(onOpen).toHaveBeenCalled();
  });

  it("shows saved state and allows unsave", () => {
    const onRemove = jest.fn();
    render(<ArticleCard article={baseArticle} onRemove={onRemove} savedIn={["MyCol"]} />);
    fireEvent.click(screen.getByText(/Saved:/i));
    expect(onRemove).toHaveBeenCalled();
  });

  it("calls onSave when not saved", () => {
    const onSave = jest.fn();
    render(<ArticleCard article={baseArticle} onSave={onSave} />);
    fireEvent.click(screen.getByText("Save"));
    expect(onSave).toHaveBeenCalled();
  });

  it("renders placeholder when image missing", () => {
    const onOpen = jest.fn();
    render(<ArticleCard article={{ ...baseArticle, imageUrl: undefined }} onOpen={onOpen} />);
    fireEvent.click(screen.getByText(/Image not available/i));
    expect(onOpen).toHaveBeenCalled();
  });

  it("shows multi-collection badge", () => {
    const onRemove = jest.fn();
    render(<ArticleCard article={baseArticle} onRemove={onRemove} savedIn={["One", "Two", "Three"]} />);
    fireEvent.click(screen.getByText(/Saved: One \+2/i));
    expect(onRemove).toHaveBeenCalled();
  });

  it("hides source chip when missing", () => {
    render(<ArticleCard article={{ ...baseArticle, source: null }} />);
    expect(screen.queryByText("Src")).not.toBeInTheDocument();
  });
});
