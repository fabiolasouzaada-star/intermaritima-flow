import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export function useUserRole() {
  const { user } = useAuth();

  const { data: userRole, isLoading } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (error) {
        // Se não encontrou role, retorna 'user' como padrão
        if (error.code === "PGRST116") return "user" as AppRole;
        throw error;
      }
      return data.role as AppRole;
    },
    enabled: !!user,
  });

  const isAdmin = userRole === "admin";
  const isManager = userRole === "manager";
  const isAdm = userRole === "adm";
  const canViewAll = isAdmin || isManager || isAdm;
  const canEditFinancials = isAdmin || isManager; // ADM não pode editar valores/margens
  const canDeleteAll = isAdmin;

  return {
    role: userRole,
    isLoading,
    isAdmin,
    isManager,
    isAdm,
    canViewAll,
    canEditFinancials,
    canDeleteAll,
  };
}
