import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";

jest.mock("../api/auth", () => ({
  login: jest.fn().mockResolvedValue({ user: { id: 1, email: "a", name: "A" }, tokens: { accessToken: "t", tokenType: "bearer" } }),
  register: jest.fn().mockResolvedValue({ user: { id: 1, email: "b", name: "B" }, tokens: { accessToken: "t2", tokenType: "bearer" } }),
  refreshAccessToken: jest.fn().mockResolvedValue(null),
  requestPasswordReset: jest.fn(),
  resetPassword: jest.fn(),
}));

jest.mock("../api/user", () => ({
  getProfile: jest.fn().mockResolvedValue({ id: 1, email: "p", name: "P" }),
  updateProfile: jest.fn().mockResolvedValue({ id: 1, email: "p", name: "P", country: "BR" }),
}));

const Tester = () => {
  const { login, register, updateUser, logout, user, accessToken } = useAuth();
  return (
    <div>
      <div data-testid="user-email">{user?.email ?? "none"}</div>
      <div data-testid="token">{accessToken ?? "none"}</div>
      <button onClick={() => login("a", "pass")}>login</button>
      <button onClick={() => register({ email: "b", password: "p", name: "B" })}>register</button>
      <button onClick={() => updateUser({ country: "BR" })}>update</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
};

describe("AuthContext", () => {
  it("handles login, register, update, logout", async () => {
    render(
      <AuthProvider>
        <Tester />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText("login"));
    await waitFor(() => expect(screen.getByTestId("user-email").textContent).toBe("a"));

    fireEvent.click(screen.getByText("register"));
    await waitFor(() => expect(screen.getByTestId("user-email").textContent).toBe("b"));

    fireEvent.click(screen.getByText("update"));
    await waitFor(() => expect(screen.getByTestId("user-email").textContent).toBe("b"));

    fireEvent.click(screen.getByText("logout"));
    await waitFor(() => expect(screen.getByTestId("user-email").textContent).toBe("none"));
  });

  it("bootstraps with stored token", async () => {
    localStorage.setItem("newsapp_access_token", "stored");
    render(
      <AuthProvider>
        <Tester />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId("user-email").textContent).toBe("p"));
    expect(localStorage.getItem("newsapp_access_token")).toBe("stored");
  });

  it("refreshes token when initial profile fails", async () => {
    const getProfile = require("../api/user").getProfile as jest.Mock;
    getProfile.mockRejectedValueOnce(new Error("bad token"));
    const refreshAccessToken = require("../api/auth").refreshAccessToken as jest.Mock;
    refreshAccessToken.mockResolvedValueOnce("newtoken");
    render(
      <AuthProvider>
        <Tester />
      </AuthProvider>
    );
    await waitFor(() => expect(localStorage.getItem("newsapp_access_token")).toBe("newtoken"));
    expect(screen.getByTestId("user-email").textContent).toBe("p");
  });

  it("logs out when refresh fails", async () => {
    localStorage.setItem("newsapp_access_token", "bad");
    const getProfile = require("../api/user").getProfile as jest.Mock;
    getProfile.mockRejectedValueOnce(new Error("bad token"));
    const refreshAccessToken = require("../api/auth").refreshAccessToken as jest.Mock;
    refreshAccessToken.mockResolvedValueOnce(null);
    render(
      <AuthProvider>
        <Tester />
      </AuthProvider>
    );
    await waitFor(() => expect(localStorage.getItem("newsapp_access_token")).toBeNull());
    expect(screen.getByTestId("user-email").textContent).toBe("none");
  });
});
