import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

export const renderWithQuery = (ui: ReactNode) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <BrowserRouter>
      <QueryClientProvider client={client}>{ui}</QueryClientProvider>
    </BrowserRouter>
  );
};

// simple sanity test to keep jest happy
describe("test utils", () => {
  it("wraps children", () => {
    const tree = renderWithQuery(<div data-testid="child" />);
    expect(tree).toBeTruthy();
  });
});
