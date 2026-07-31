import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Router } from "wouter";
import userEvent from "@testing-library/user-event";

vi.mock("@workspace/auth-web", () => ({
  useAuth: () => ({
    signIn: vi.fn(),
    isAuthenticated: false,
  }),
  supabase: {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: null } })),
      setSession: vi.fn(async () => ({ error: null })),
    },
  },
}));

import Login from "@/pages/login";

const { supabase } = await import("@workspace/auth-web");

describe("Login de demonstração administrativa", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mostra o botão de demo admin e envia type 'admin' ao backend", async () => {
    const mockStatusResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ enabled: true, adminEnabled: true }),
    };

    const mockLoginResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        access_token: "token-admin",
        refresh_token: "refresh-admin",
        expires_in: 3600,
      }),
    };

    const fetchSpy = vi
      .spyOn(globalThis, "fetch" as any)
      .mockResolvedValueOnce(mockStatusResponse as any)
      .mockResolvedValueOnce(mockLoginResponse as any);

    render(
      <Router>
        <Login />
      </Router>,
    );

    const adminSection = await screen.findByTestId("admin-demo-access-section");
    expect(adminSection).toBeInTheDocument();

    const adminButton = screen.getByTestId("button-login-admin-demo");
    await userEvent.click(adminButton);

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy.mock.calls[1][0]).toBe("/api/demo/login");
    expect(fetchSpy.mock.calls[1][1]).toEqual({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "admin" }),
    });
    expect(supabase.auth.setSession).toHaveBeenCalledWith({
      access_token: "token-admin",
      refresh_token: "refresh-admin",
    });
  });
});
