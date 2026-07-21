import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";

// Simulação de fetch user via LocalStorage para persistência no Frontend sem Backend
async function fetchUser(): Promise<User | null> {
  // Simula delay de rede
  await new Promise(resolve => setTimeout(resolve, 500));

  const storedUser = localStorage.getItem("escuta_user");
  if (!storedUser) {
    return null;
  }

  try {
    const parsed = JSON.parse(storedUser);
    // Adapta o objeto do localStorage para o tipo User esperado
    return {
      id: 1, // Mock ID
      username: parsed.email || "user",
      password: "",
      firstName: parsed.name || "Cidadão",
      lastName: "",
      isAdmin: false,
      profileImageUrl: parsed.profile || null,
      ...parsed
    } as User;
  } catch (e) {
    return null;
  }
}

async function logout(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  localStorage.removeItem("escuta_user");
  // Opcional: Limpar reports se quiser
  // localStorage.removeItem("reports");
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["auth_user"],
    queryFn: fetchUser,
    // Revalida sempre que a janela ganha foco para pegar mudanças do localStorage (ex: login em outra aba ou pós cadastro)
    refetchOnWindowFocus: true,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["auth_user"], null);
      window.location.href = "/auth"; // Redireciona forçado para garantir limpeza
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
