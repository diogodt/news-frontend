import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: "/app/search" }),
  };
});

jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("AppLayout", () => {
  it("shows missing API key badge and redirects", () => {
    const useAuth = require("../context/AuthContext").useAuth as jest.Mock;
    useAuth.mockReturnValue({ user: { name: "Tester", email: "t@test.com", newsApiToken: null }, logout: jest.fn() });
    render(
      <MemoryRouter>
        <AppLayout />
      </MemoryRouter>
    );
    expect(screen.getByText(/Add your NewsAPI key/i)).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith("/app/profile", { replace: true, state: { reason: "missing_api_key" } });
  });

  it("renders nav and allows logout menu", () => {
    const logout = jest.fn();
    const useAuth = require("../context/AuthContext").useAuth as jest.Mock;
    useAuth.mockReturnValue({ user: { name: "Tester Two", email: "two@test.com", newsApiToken: "key" }, logout });
    render(
      <MemoryRouter>
        <AppLayout />
      </MemoryRouter>
    );
    expect(screen.queryByText(/Add your NewsAPI key/i)).not.toBeInTheDocument();
    // open menu
    fireEvent.click(screen.getByLabelText(/user menu/i));
    fireEvent.click(screen.getByText(/Logout/i));
    expect(logout).toHaveBeenCalled();
  });

  it("navigates via brand", () => {
    const useAuth = require("../context/AuthContext").useAuth as jest.Mock;
    useAuth.mockReturnValue({ user: { name: "Tester Three", email: "three@test.com", newsApiToken: "key" }, logout: jest.fn() });
    render(
      <MemoryRouter>
        <AppLayout />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByAltText(/ActiveView/i));
    expect(mockNavigate).toHaveBeenCalledWith("/app/search");
  });
});
