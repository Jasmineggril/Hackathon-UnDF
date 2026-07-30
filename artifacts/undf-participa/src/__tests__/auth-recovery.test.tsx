import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Router } from "wouter";
import userEvent from "@testing-library/user-event";

vi.mock("@workspace/auth-web", () => {
  return {
    useAuth: () => ({
      signIn: vi.fn(),
      isAuthenticated: false,
    }),
    supabase: {
      auth: {
        resetPasswordForEmail: vi.fn(async () => ({ error: null })),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        getSession: vi.fn(async () => ({ data: { session: null } })),
        updateUser: vi.fn(async () => ({ error: null })),
        signOut: vi.fn(async () => ({})),
      },
    },
  };
});

import Login from "@/pages/login";
import RecuperarSenha from "@/pages/recuperar-senha";

const { supabase } = await import("@workspace/auth-web");

describe("Recuperação de senha", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exibe link de recuperação na tela de login", () => {
    render(
      <Router>
        <Login />
      </Router>,
    );

    const forgotLink = screen.getByTestId("link-forgot-password");
    expect(forgotLink).toBeInTheDocument();
    expect(forgotLink).toHaveAttribute("href", "/recuperar-senha");
  });

  it("exibe formulário de recuperação de senha", () => {
    render(<RecuperarSenha />);

    expect(screen.getByTestId("input-email-recovery")).toBeInTheDocument();
    expect(screen.getByTestId("button-send-recovery")).toBeInTheDocument();
  });

  it("envia solicitação de redefinição sem revelar presença do e-mail", async () => {
    render(<RecuperarSenha />);

    await userEvent.type(screen.getByTestId("input-email-recovery"), "usuario@undf.edu.br");
    await userEvent.click(screen.getByTestId("button-send-recovery"));

    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      "usuario@undf.edu.br",
      expect.objectContaining({ redirectTo: expect.any(String) }),
    );
    expect(await screen.findByText(/Verifique seu e-mail/i)).toBeInTheDocument();
  });
});
