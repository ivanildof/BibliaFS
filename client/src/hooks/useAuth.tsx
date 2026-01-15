import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: 1,
    refetchOnWindowFocus: true,
    staleTime: 0, // Force refetch to ensure fresh auth state
  });

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
  };
}
