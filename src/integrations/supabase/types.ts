export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      acoes_retencao: {
        Row: {
          cliente_id: string
          created_at: string
          data_acao: string
          descricao: string
          id: string
          responsavel_id: string | null
          resultado: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_acao: string
          descricao: string
          id?: string
          responsavel_id?: string | null
          resultado?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_acao?: string
          descricao?: string
          id?: string
          responsavel_id?: string | null
          resultado?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acoes_retencao_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acoes_retencao_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      acoes_visita: {
        Row: {
          created_at: string
          descricao: string
          id: string
          status: Database["public"]["Enums"]["status_tarefa"]
          visita_id: string
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          status?: Database["public"]["Enums"]["status_tarefa"]
          visita_id: string
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          status?: Database["public"]["Enums"]["status_tarefa"]
          visita_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "acoes_visita_visita_id_fkey"
            columns: ["visita_id"]
            isOneToOne: false
            referencedRelation: "visitas"
            referencedColumns: ["id"]
          },
        ]
      }
      anexos: {
        Row: {
          cliente_id: string | null
          contrato_id: string | null
          created_at: string
          id: string
          nome: string
          oportunidade_id: string | null
          tamanho: number | null
          tipo: string | null
          uploaded_by: string | null
          url: string
          visita_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          contrato_id?: string | null
          created_at?: string
          id?: string
          nome: string
          oportunidade_id?: string | null
          tamanho?: number | null
          tipo?: string | null
          uploaded_by?: string | null
          url: string
          visita_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          contrato_id?: string | null
          created_at?: string
          id?: string
          nome?: string
          oportunidade_id?: string | null
          tamanho?: number | null
          tipo?: string | null
          uploaded_by?: string | null
          url?: string
          visita_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anexos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anexos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anexos_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anexos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anexos_visita_id_fkey"
            columns: ["visita_id"]
            isOneToOne: false
            referencedRelation: "visitas"
            referencedColumns: ["id"]
          },
        ]
      }
      cliente_servicos: {
        Row: {
          cliente_id: string
          created_at: string
          descricao: string | null
          id: string
          servico: Database["public"]["Enums"]["tipo_servico"]
        }
        Insert: {
          cliente_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          servico: Database["public"]["Enums"]["tipo_servico"]
        }
        Update: {
          cliente_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          servico?: Database["public"]["Enums"]["tipo_servico"]
        }
        Relationships: [
          {
            foreignKeyName: "cliente_servicos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          cnpj: string
          created_at: string
          created_by: string | null
          data_proposta: string | null
          empresa: string
          id: string
          numero_proposta: string | null
          observacoes: string | null
          potencial: string | null
          proposta_url: string | null
          segmento: Database["public"]["Enums"]["segmento_cliente"]
          site: string | null
          status: Database["public"]["Enums"]["status_cliente"]
          updated_at: string
          vencimento_proposta: string | null
        }
        Insert: {
          cnpj: string
          created_at?: string
          created_by?: string | null
          data_proposta?: string | null
          empresa: string
          id?: string
          numero_proposta?: string | null
          observacoes?: string | null
          potencial?: string | null
          proposta_url?: string | null
          segmento: Database["public"]["Enums"]["segmento_cliente"]
          site?: string | null
          status?: Database["public"]["Enums"]["status_cliente"]
          updated_at?: string
          vencimento_proposta?: string | null
        }
        Update: {
          cnpj?: string
          created_at?: string
          created_by?: string | null
          data_proposta?: string | null
          empresa?: string
          id?: string
          numero_proposta?: string | null
          observacoes?: string | null
          potencial?: string | null
          proposta_url?: string | null
          segmento?: Database["public"]["Enums"]["segmento_cliente"]
          site?: string | null
          status?: Database["public"]["Enums"]["status_cliente"]
          updated_at?: string
          vencimento_proposta?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contatos_cliente: {
        Row: {
          cargo: string | null
          cliente_id: string
          created_at: string
          email: string | null
          id: string
          is_principal: boolean | null
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cargo?: string | null
          cliente_id: string
          created_at?: string
          email?: string | null
          id?: string
          is_principal?: boolean | null
          nome: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cargo?: string | null
          cliente_id?: string
          created_at?: string
          email?: string | null
          id?: string
          is_principal?: boolean | null
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contatos_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      contrato_servicos: {
        Row: {
          contrato_id: string
          created_at: string
          descricao: string | null
          id: string
          servico: Database["public"]["Enums"]["tipo_servico"]
          valor: number | null
        }
        Insert: {
          contrato_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          servico: Database["public"]["Enums"]["tipo_servico"]
          valor?: number | null
        }
        Update: {
          contrato_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          servico?: Database["public"]["Enums"]["tipo_servico"]
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contrato_servicos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos: {
        Row: {
          cliente_id: string
          created_at: string
          data_fim: string | null
          data_inicio: string
          id: string
          numero_contrato: string
          observacoes: string | null
          oportunidade_id: string | null
          status: Database["public"]["Enums"]["status_contrato"]
          updated_at: string
          valor_total: number
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          id?: string
          numero_contrato: string
          observacoes?: string | null
          oportunidade_id?: string | null
          status?: Database["public"]["Enums"]["status_contrato"]
          updated_at?: string
          valor_total: number
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          id?: string
          numero_contrato?: string
          observacoes?: string | null
          oportunidade_id?: string | null
          status?: Database["public"]["Enums"]["status_contrato"]
          updated_at?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          cliente_id: string | null
          created_at: string
          data_fim: string | null
          data_inicio: string
          descricao: string | null
          id: string
          responsavel_id: string | null
          tipo: Database["public"]["Enums"]["tipo_evento"]
          titulo: string
          updated_at: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          descricao?: string | null
          id?: string
          responsavel_id?: string | null
          tipo: Database["public"]["Enums"]["tipo_evento"]
          titulo: string
          updated_at?: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          descricao?: string | null
          id?: string
          responsavel_id?: string | null
          tipo?: Database["public"]["Enums"]["tipo_evento"]
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ocorrencias: {
        Row: {
          contrato_id: string
          created_at: string
          data_resolucao: string | null
          descricao: string
          id: string
          responsavel_id: string | null
          status: Database["public"]["Enums"]["status_ocorrencia"]
          tipo: Database["public"]["Enums"]["tipo_ocorrencia"]
          updated_at: string
        }
        Insert: {
          contrato_id: string
          created_at?: string
          data_resolucao?: string | null
          descricao: string
          id?: string
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_ocorrencia"]
          tipo: Database["public"]["Enums"]["tipo_ocorrencia"]
          updated_at?: string
        }
        Update: {
          contrato_id?: string
          created_at?: string
          data_resolucao?: string | null
          descricao?: string
          id?: string
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_ocorrencia"]
          tipo?: Database["public"]["Enums"]["tipo_ocorrencia"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ocorrencias_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocorrencias_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      oportunidades: {
        Row: {
          cliente_id: string
          created_at: string
          descricao: string | null
          id: string
          previsao_fechamento: string | null
          probabilidade: number | null
          responsavel_id: string | null
          status: Database["public"]["Enums"]["status_oportunidade"]
          titulo: string
          updated_at: string
          valor: number | null
        }
        Insert: {
          cliente_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          previsao_fechamento?: string | null
          probabilidade?: number | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_oportunidade"]
          titulo: string
          updated_at?: string
          valor?: number | null
        }
        Update: {
          cliente_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          previsao_fechamento?: string | null
          probabilidade?: number | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_oportunidade"]
          titulo?: string
          updated_at?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_venda: {
        Row: {
          contrato_id: string
          created_at: string
          data_contato: string
          id: string
          observacoes: string | null
          responsavel_id: string | null
          satisfacao: number | null
          tipo_contato: string | null
        }
        Insert: {
          contrato_id: string
          created_at?: string
          data_contato: string
          id?: string
          observacoes?: string | null
          responsavel_id?: string | null
          satisfacao?: number | null
          tipo_contato?: string | null
        }
        Update: {
          contrato_id?: string
          created_at?: string
          data_contato?: string
          id?: string
          observacoes?: string | null
          responsavel_id?: string | null
          satisfacao?: number | null
          tipo_contato?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_venda_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_venda_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cargo: string | null
          created_at: string
          email: string
          id: string
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string
          email: string
          id: string
          nome: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tarefas: {
        Row: {
          cliente_id: string | null
          created_at: string
          data_vencimento: string | null
          descricao: string | null
          id: string
          prioridade: Database["public"]["Enums"]["prioridade_tarefa"]
          responsavel_id: string | null
          status: Database["public"]["Enums"]["status_tarefa"]
          titulo: string
          updated_at: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          data_vencimento?: string | null
          descricao?: string | null
          id?: string
          prioridade?: Database["public"]["Enums"]["prioridade_tarefa"]
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_tarefa"]
          titulo: string
          updated_at?: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          data_vencimento?: string | null
          descricao?: string | null
          id?: string
          prioridade?: Database["public"]["Enums"]["prioridade_tarefa"]
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_tarefa"]
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visitas: {
        Row: {
          cliente_id: string
          created_at: string
          data_visita: string
          dores_percebidas: string | null
          id: string
          objetivo: string | null
          oportunidades_identificadas: string | null
          proximos_passos: string | null
          responsavel_id: string | null
          situacao_atual: string | null
          status: Database["public"]["Enums"]["status_visita"]
          updated_at: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_visita: string
          dores_percebidas?: string | null
          id?: string
          objetivo?: string | null
          oportunidades_identificadas?: string | null
          proximos_passos?: string | null
          responsavel_id?: string | null
          situacao_atual?: string | null
          status?: Database["public"]["Enums"]["status_visita"]
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_visita?: string
          dores_percebidas?: string | null
          id?: string
          objetivo?: string | null
          oportunidades_identificadas?: string | null
          proximos_passos?: string | null
          responsavel_id?: string | null
          situacao_atual?: string | null
          status?: Database["public"]["Enums"]["status_visita"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      prioridade_tarefa: "baixa" | "media" | "alta" | "urgente"
      segmento_cliente:
        | "industrial"
        | "comercial"
        | "varejo"
        | "tecnologia"
        | "outros"
      status_cliente: "ativo" | "inativo" | "prospecto"
      status_contrato: "ativo" | "suspenso" | "encerrado" | "renovacao"
      status_ocorrencia: "aberta" | "em_analise" | "resolvida" | "fechada"
      status_oportunidade:
        | "qualificacao"
        | "proposta"
        | "negociacao"
        | "fechamento"
        | "ganho"
        | "perdido"
      status_tarefa: "pendente" | "em_andamento" | "concluida" | "cancelada"
      status_visita: "agendada" | "realizada" | "cancelada"
      tipo_evento: "reuniao" | "follow_up" | "apresentacao" | "visita" | "outro"
      tipo_ocorrencia:
        | "reclamacao"
        | "duvida"
        | "sugestao"
        | "problema_tecnico"
        | "outro"
      tipo_servico:
        | "maritimo"
        | "aereo"
        | "rodoviario"
        | "armazenagem"
        | "desembaraco"
        | "outros"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      prioridade_tarefa: ["baixa", "media", "alta", "urgente"],
      segmento_cliente: [
        "industrial",
        "comercial",
        "varejo",
        "tecnologia",
        "outros",
      ],
      status_cliente: ["ativo", "inativo", "prospecto"],
      status_contrato: ["ativo", "suspenso", "encerrado", "renovacao"],
      status_ocorrencia: ["aberta", "em_analise", "resolvida", "fechada"],
      status_oportunidade: [
        "qualificacao",
        "proposta",
        "negociacao",
        "fechamento",
        "ganho",
        "perdido",
      ],
      status_tarefa: ["pendente", "em_andamento", "concluida", "cancelada"],
      status_visita: ["agendada", "realizada", "cancelada"],
      tipo_evento: ["reuniao", "follow_up", "apresentacao", "visita", "outro"],
      tipo_ocorrencia: [
        "reclamacao",
        "duvida",
        "sugestao",
        "problema_tecnico",
        "outro",
      ],
      tipo_servico: [
        "maritimo",
        "aereo",
        "rodoviario",
        "armazenagem",
        "desembaraco",
        "outros",
      ],
    },
  },
} as const
