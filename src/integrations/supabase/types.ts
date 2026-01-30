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
          created_by: string | null
          data_acao: string
          descricao: string
          id: string
          responsavel_id: string | null
          resultado: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string
          created_by?: string | null
          data_acao: string
          descricao: string
          id?: string
          responsavel_id?: string | null
          resultado?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string
          created_by?: string | null
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
      acoes_reuniao: {
        Row: {
          acao: string
          area_responsavel: Database["public"]["Enums"]["area_envolvida"]
          areas_responsaveis: string[] | null
          cliente_id: string | null
          comentarios: string | null
          created_at: string
          created_by: string | null
          data_conclusao: string | null
          id: string
          impacto: Database["public"]["Enums"]["impacto_acao"] | null
          prazo: string | null
          prioridade: Database["public"]["Enums"]["prioridade_acao_reuniao"]
          responsavel_id: string | null
          responsavel_nome: string | null
          reuniao_id: string
          status: Database["public"]["Enums"]["status_acao_reuniao"]
          updated_at: string
        }
        Insert: {
          acao: string
          area_responsavel: Database["public"]["Enums"]["area_envolvida"]
          areas_responsaveis?: string[] | null
          cliente_id?: string | null
          comentarios?: string | null
          created_at?: string
          created_by?: string | null
          data_conclusao?: string | null
          id?: string
          impacto?: Database["public"]["Enums"]["impacto_acao"] | null
          prazo?: string | null
          prioridade?: Database["public"]["Enums"]["prioridade_acao_reuniao"]
          responsavel_id?: string | null
          responsavel_nome?: string | null
          reuniao_id: string
          status?: Database["public"]["Enums"]["status_acao_reuniao"]
          updated_at?: string
        }
        Update: {
          acao?: string
          area_responsavel?: Database["public"]["Enums"]["area_envolvida"]
          areas_responsaveis?: string[] | null
          cliente_id?: string | null
          comentarios?: string | null
          created_at?: string
          created_by?: string | null
          data_conclusao?: string | null
          id?: string
          impacto?: Database["public"]["Enums"]["impacto_acao"] | null
          prazo?: string | null
          prioridade?: Database["public"]["Enums"]["prioridade_acao_reuniao"]
          responsavel_id?: string | null
          responsavel_nome?: string | null
          reuniao_id?: string
          status?: Database["public"]["Enums"]["status_acao_reuniao"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "acoes_reuniao_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acoes_reuniao_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acoes_reuniao_reuniao_id_fkey"
            columns: ["reuniao_id"]
            isOneToOne: false
            referencedRelation: "reunioes"
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
          created_by: string | null
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
          created_by?: string | null
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
          created_by?: string | null
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
          cnpj: string | null
          created_at: string
          created_by: string | null
          data_proposta: string | null
          empresa: string
          id: string
          is_cliente_fs: boolean | null
          is_freight_forwarder: boolean | null
          numero_proposta: string | null
          observacoes: string | null
          potencial: string | null
          proposta_url: string | null
          responsavel_codigo: string | null
          segmento: Database["public"]["Enums"]["segmento_cliente"]
          segmentos: string[] | null
          site: string | null
          status: Database["public"]["Enums"]["status_cliente"]
          terminais_operados: string[] | null
          tipos_servico: string[] | null
          updated_at: string
          vencimento_proposta: string | null
          volume_12_meses: number | null
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          created_by?: string | null
          data_proposta?: string | null
          empresa: string
          id?: string
          is_cliente_fs?: boolean | null
          is_freight_forwarder?: boolean | null
          numero_proposta?: string | null
          observacoes?: string | null
          potencial?: string | null
          proposta_url?: string | null
          responsavel_codigo?: string | null
          segmento: Database["public"]["Enums"]["segmento_cliente"]
          segmentos?: string[] | null
          site?: string | null
          status?: Database["public"]["Enums"]["status_cliente"]
          terminais_operados?: string[] | null
          tipos_servico?: string[] | null
          updated_at?: string
          vencimento_proposta?: string | null
          volume_12_meses?: number | null
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          created_by?: string | null
          data_proposta?: string | null
          empresa?: string
          id?: string
          is_cliente_fs?: boolean | null
          is_freight_forwarder?: boolean | null
          numero_proposta?: string | null
          observacoes?: string | null
          potencial?: string | null
          proposta_url?: string | null
          responsavel_codigo?: string | null
          segmento?: Database["public"]["Enums"]["segmento_cliente"]
          segmentos?: string[] | null
          site?: string | null
          status?: Database["public"]["Enums"]["status_cliente"]
          terminais_operados?: string[] | null
          tipos_servico?: string[] | null
          updated_at?: string
          vencimento_proposta?: string | null
          volume_12_meses?: number | null
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
          sede: string | null
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
          sede?: string | null
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
          sede?: string | null
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
          created_by: string | null
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
          created_by?: string | null
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
          created_by?: string | null
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
          created_by: string | null
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
          created_by?: string | null
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
          created_by?: string | null
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
      modelos_proposta: {
        Row: {
          anexos_padrao: Json | null
          assinatura_padrao: string
          ativo: boolean
          cabecalho_institucional: string
          created_at: string
          created_by: string | null
          estrutura_servicos: Json
          id: string
          nome: string
          notas_condicoes: string
          texto_introdutorio: string
          tipo: Database["public"]["Enums"]["tipo_modelo_proposta"]
          updated_at: string
        }
        Insert: {
          anexos_padrao?: Json | null
          assinatura_padrao: string
          ativo?: boolean
          cabecalho_institucional: string
          created_at?: string
          created_by?: string | null
          estrutura_servicos?: Json
          id?: string
          nome: string
          notas_condicoes: string
          texto_introdutorio: string
          tipo: Database["public"]["Enums"]["tipo_modelo_proposta"]
          updated_at?: string
        }
        Update: {
          anexos_padrao?: Json | null
          assinatura_padrao?: string
          ativo?: boolean
          cabecalho_institucional?: string
          created_at?: string
          created_by?: string | null
          estrutura_servicos?: Json
          id?: string
          nome?: string
          notas_condicoes?: string
          texto_introdutorio?: string
          tipo?: Database["public"]["Enums"]["tipo_modelo_proposta"]
          updated_at?: string
        }
        Relationships: []
      }
      ocorrencias: {
        Row: {
          contrato_id: string
          created_at: string
          created_by: string | null
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
          created_by?: string | null
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
          created_by?: string | null
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
          created_by: string | null
          descricao: string | null
          descricao_perda: string | null
          id: string
          motivo_perda: string | null
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
          created_by?: string | null
          descricao?: string | null
          descricao_perda?: string | null
          id?: string
          motivo_perda?: string | null
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
          created_by?: string | null
          descricao?: string | null
          descricao_perda?: string | null
          id?: string
          motivo_perda?: string | null
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
      pipeline_retomada: {
        Row: {
          cliente_id: string
          created_at: string | null
          created_by: string | null
          data_movimentacao: string | null
          estagio: string
          id: string
          observacoes: string | null
          updated_at: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          created_by?: string | null
          data_movimentacao?: string | null
          estagio: string
          id?: string
          observacoes?: string | null
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          created_by?: string | null
          data_movimentacao?: string | null
          estagio?: string
          id?: string
          observacoes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_retomada_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      plano_acoes: {
        Row: {
          areas: string[] | null
          cliente_id: string
          created_at: string
          created_by: string | null
          data_limite: string | null
          descricao: string | null
          id: string
          observacoes: string | null
          prioridade: Database["public"]["Enums"]["prioridade_acao"]
          responsavel_id: string | null
          status: Database["public"]["Enums"]["status_oportunidade"]
          tipo_servico: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          areas?: string[] | null
          cliente_id: string
          created_at?: string
          created_by?: string | null
          data_limite?: string | null
          descricao?: string | null
          id?: string
          observacoes?: string | null
          prioridade?: Database["public"]["Enums"]["prioridade_acao"]
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_oportunidade"]
          tipo_servico?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          areas?: string[] | null
          cliente_id?: string
          created_at?: string
          created_by?: string | null
          data_limite?: string | null
          descricao?: string | null
          id?: string
          observacoes?: string | null
          prioridade?: Database["public"]["Enums"]["prioridade_acao"]
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_oportunidade"]
          tipo_servico?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plano_acoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plano_acoes_responsavel_id_fkey"
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
          created_by: string | null
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
          created_by?: string | null
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
          created_by?: string | null
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
      pre_alerta_itens: {
        Row: {
          armador: string | null
          cliente_cnpj: string | null
          cliente_id: string | null
          cliente_nome: string
          cntr_numero: string | null
          comercial_responsavel: string | null
          created_at: string
          created_by: string | null
          eta: string | null
          id: string
          is_cliente_intermaritima: boolean | null
          navio: string
          nv: string | null
          observacoes: string | null
          peso_bruto: number | null
          quantidade: number | null
          status_comercial: string | null
          terminal_direcionamento: string | null
          tipo_carga: string | null
          tipo_container: string | null
          updated_at: string
          upload_id: string | null
        }
        Insert: {
          armador?: string | null
          cliente_cnpj?: string | null
          cliente_id?: string | null
          cliente_nome: string
          cntr_numero?: string | null
          comercial_responsavel?: string | null
          created_at?: string
          created_by?: string | null
          eta?: string | null
          id?: string
          is_cliente_intermaritima?: boolean | null
          navio: string
          nv?: string | null
          observacoes?: string | null
          peso_bruto?: number | null
          quantidade?: number | null
          status_comercial?: string | null
          terminal_direcionamento?: string | null
          tipo_carga?: string | null
          tipo_container?: string | null
          updated_at?: string
          upload_id?: string | null
        }
        Update: {
          armador?: string | null
          cliente_cnpj?: string | null
          cliente_id?: string | null
          cliente_nome?: string
          cntr_numero?: string | null
          comercial_responsavel?: string | null
          created_at?: string
          created_by?: string | null
          eta?: string | null
          id?: string
          is_cliente_intermaritima?: boolean | null
          navio?: string
          nv?: string | null
          observacoes?: string | null
          peso_bruto?: number | null
          quantidade?: number | null
          status_comercial?: string | null
          terminal_direcionamento?: string | null
          tipo_carga?: string | null
          tipo_container?: string | null
          updated_at?: string
          upload_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pre_alerta_itens_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_alerta_itens_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "pre_alerta_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_alerta_uploads: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          nome_arquivo: string
          processado: boolean | null
          total_registros: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          nome_arquivo: string
          processado?: boolean | null
          total_registros?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          nome_arquivo?: string
          processado?: boolean | null
          total_registros?: number | null
        }
        Relationships: []
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
      proposta_historico: {
        Row: {
          alteracoes: Json
          created_at: string
          created_by: string | null
          id: string
          observacao: string | null
          proposta_id: string
          status_anterior: Database["public"]["Enums"]["status_proposta"] | null
          status_novo: Database["public"]["Enums"]["status_proposta"] | null
          versao: number
        }
        Insert: {
          alteracoes: Json
          created_at?: string
          created_by?: string | null
          id?: string
          observacao?: string | null
          proposta_id: string
          status_anterior?:
            | Database["public"]["Enums"]["status_proposta"]
            | null
          status_novo?: Database["public"]["Enums"]["status_proposta"] | null
          versao: number
        }
        Update: {
          alteracoes?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          observacao?: string | null
          proposta_id?: string
          status_anterior?:
            | Database["public"]["Enums"]["status_proposta"]
            | null
          status_novo?: Database["public"]["Enums"]["status_proposta"] | null
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposta_historico_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      propostas: {
        Row: {
          aprovada_em: string | null
          assinatura_padrao: string
          cabecalho_institucional: string
          cliente_id: string
          contato_cargo: string | null
          contato_email: string | null
          contato_nome: string | null
          contato_telefone: string | null
          created_at: string
          created_by: string | null
          enviada_em: string | null
          id: string
          modelo_id: string
          notas_condicoes: string
          numero_proposta: string
          observacoes: string | null
          oportunidade_id: string | null
          pdf_url: string | null
          prazo_validade: string | null
          rejeitada_em: string | null
          responsavel_id: string | null
          servicos: Json
          status: Database["public"]["Enums"]["status_proposta"]
          texto_introdutorio: string
          updated_at: string
          valor_total: number | null
          versao: number
        }
        Insert: {
          aprovada_em?: string | null
          assinatura_padrao: string
          cabecalho_institucional: string
          cliente_id: string
          contato_cargo?: string | null
          contato_email?: string | null
          contato_nome?: string | null
          contato_telefone?: string | null
          created_at?: string
          created_by?: string | null
          enviada_em?: string | null
          id?: string
          modelo_id: string
          notas_condicoes: string
          numero_proposta: string
          observacoes?: string | null
          oportunidade_id?: string | null
          pdf_url?: string | null
          prazo_validade?: string | null
          rejeitada_em?: string | null
          responsavel_id?: string | null
          servicos?: Json
          status?: Database["public"]["Enums"]["status_proposta"]
          texto_introdutorio: string
          updated_at?: string
          valor_total?: number | null
          versao?: number
        }
        Update: {
          aprovada_em?: string | null
          assinatura_padrao?: string
          cabecalho_institucional?: string
          cliente_id?: string
          contato_cargo?: string | null
          contato_email?: string | null
          contato_nome?: string | null
          contato_telefone?: string | null
          created_at?: string
          created_by?: string | null
          enviada_em?: string | null
          id?: string
          modelo_id?: string
          notas_condicoes?: string
          numero_proposta?: string
          observacoes?: string | null
          oportunidade_id?: string | null
          pdf_url?: string | null
          prazo_validade?: string | null
          rejeitada_em?: string | null
          responsavel_id?: string | null
          servicos?: Json
          status?: Database["public"]["Enums"]["status_proposta"]
          texto_introdutorio?: string
          updated_at?: string
          valor_total?: number | null
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "propostas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_modelo_id_fkey"
            columns: ["modelo_id"]
            isOneToOne: false
            referencedRelation: "modelos_proposta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      propostas_cliente: {
        Row: {
          cliente_id: string
          created_at: string
          created_by: string | null
          data_proposta: string | null
          id: string
          numero_proposta: string
          observacoes: string | null
          proposta_url: string | null
          servico: string
          status: string | null
          tipo_servico: string | null
          updated_at: string
          vencimento_proposta: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string
          created_by?: string | null
          data_proposta?: string | null
          id?: string
          numero_proposta: string
          observacoes?: string | null
          proposta_url?: string | null
          servico: string
          status?: string | null
          tipo_servico?: string | null
          updated_at?: string
          vencimento_proposta?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string
          created_by?: string | null
          data_proposta?: string | null
          id?: string
          numero_proposta?: string
          observacoes?: string | null
          proposta_url?: string | null
          servico?: string
          status?: string | null
          tipo_servico?: string | null
          updated_at?: string
          vencimento_proposta?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "propostas_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      reunioes: {
        Row: {
          area_envolvida: Database["public"]["Enums"]["area_envolvida"]
          areas_envolvidas: string[] | null
          cliente_id: string | null
          created_at: string
          created_by: string | null
          data_reuniao: string
          id: string
          objetivo: string | null
          observacoes_estrategicas: string | null
          participantes: string | null
          proxima_reuniao: string | null
          resumo: string | null
          status: Database["public"]["Enums"]["status_reuniao"]
          tipo: Database["public"]["Enums"]["tipo_reuniao"]
          updated_at: string
        }
        Insert: {
          area_envolvida: Database["public"]["Enums"]["area_envolvida"]
          areas_envolvidas?: string[] | null
          cliente_id?: string | null
          created_at?: string
          created_by?: string | null
          data_reuniao: string
          id?: string
          objetivo?: string | null
          observacoes_estrategicas?: string | null
          participantes?: string | null
          proxima_reuniao?: string | null
          resumo?: string | null
          status?: Database["public"]["Enums"]["status_reuniao"]
          tipo: Database["public"]["Enums"]["tipo_reuniao"]
          updated_at?: string
        }
        Update: {
          area_envolvida?: Database["public"]["Enums"]["area_envolvida"]
          areas_envolvidas?: string[] | null
          cliente_id?: string | null
          created_at?: string
          created_by?: string | null
          data_reuniao?: string
          id?: string
          objetivo?: string | null
          observacoes_estrategicas?: string | null
          participantes?: string | null
          proxima_reuniao?: string | null
          resumo?: string | null
          status?: Database["public"]["Enums"]["status_reuniao"]
          tipo?: Database["public"]["Enums"]["tipo_reuniao"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reunioes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefas: {
        Row: {
          cliente_id: string | null
          created_at: string
          created_by: string | null
          data_vencimento: string | null
          descricao: string | null
          id: string
          prioridade: Database["public"]["Enums"]["prioridade_tarefa"]
          responsavel_id: string | null
          responsavel_nome: string | null
          status: Database["public"]["Enums"]["status_tarefa"]
          titulo: string
          updated_at: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          created_by?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          id?: string
          prioridade?: Database["public"]["Enums"]["prioridade_tarefa"]
          responsavel_id?: string | null
          responsavel_nome?: string | null
          status?: Database["public"]["Enums"]["status_tarefa"]
          titulo: string
          updated_at?: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          created_by?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          id?: string
          prioridade?: Database["public"]["Enums"]["prioridade_tarefa"]
          responsavel_id?: string | null
          responsavel_nome?: string | null
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
      tarefas_acao: {
        Row: {
          acao_id: string
          alerta_atraso: boolean | null
          comentarios: string | null
          created_at: string
          created_by: string | null
          data_final: string | null
          data_inicio: string | null
          descricao: string
          id: string
          responsavel_id: string | null
          sla_horas: number | null
          status: Database["public"]["Enums"]["status_tarefa_acao"]
          updated_at: string
        }
        Insert: {
          acao_id: string
          alerta_atraso?: boolean | null
          comentarios?: string | null
          created_at?: string
          created_by?: string | null
          data_final?: string | null
          data_inicio?: string | null
          descricao: string
          id?: string
          responsavel_id?: string | null
          sla_horas?: number | null
          status?: Database["public"]["Enums"]["status_tarefa_acao"]
          updated_at?: string
        }
        Update: {
          acao_id?: string
          alerta_atraso?: boolean | null
          comentarios?: string | null
          created_at?: string
          created_by?: string | null
          data_final?: string | null
          data_inicio?: string | null
          descricao?: string
          id?: string
          responsavel_id?: string | null
          sla_horas?: number | null
          status?: Database["public"]["Enums"]["status_tarefa_acao"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_acao_acao_id_fkey"
            columns: ["acao_id"]
            isOneToOne: false
            referencedRelation: "acoes_reuniao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_acao_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visitas: {
        Row: {
          cliente_id: string
          created_at: string
          created_by: string | null
          data_visita: string
          dores_percebidas: string | null
          id: string
          modalidade: Database["public"]["Enums"]["modalidade_visita"] | null
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
          created_by?: string | null
          data_visita: string
          dores_percebidas?: string | null
          id?: string
          modalidade?: Database["public"]["Enums"]["modalidade_visita"] | null
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
          created_by?: string | null
          data_visita?: string
          dores_percebidas?: string | null
          id?: string
          modalidade?: Database["public"]["Enums"]["modalidade_visita"] | null
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
      check_overdue_acoes_tarefas: { Args: never; Returns: undefined }
      check_stale_opportunities: { Args: never; Returns: undefined }
      gerar_numero_proposta: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_adm: { Args: { _user_id: string }; Returns: boolean }
      is_admin_or_manager: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "manager" | "user" | "adm"
      area_envolvida:
        | "comercial"
        | "inter_i_tps"
        | "transporte"
        | "cdex"
        | "porto"
        | "qualidade"
        | "financeiro"
      impacto_acao:
        | "financeiro"
        | "operacional"
        | "relacionamento_cliente"
        | "compliance"
      modalidade_visita: "presencial" | "remota"
      prioridade_acao: "baixa" | "media" | "alta" | "urgente"
      prioridade_acao_reuniao: "alta" | "media" | "baixa"
      prioridade_tarefa: "baixa" | "media" | "alta" | "urgente"
      segmento_cliente:
        | "industrial"
        | "comercial"
        | "varejo"
        | "tecnologia"
        | "outros"
      status_acao: "pendente" | "em_andamento" | "concluida" | "cancelada"
      status_acao_reuniao:
        | "nao_iniciada"
        | "em_andamento"
        | "concluida"
        | "atrasada"
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
        | "sem_retorno"
      status_proposta: "rascunho" | "enviada" | "aprovada" | "rejeitada"
      status_reuniao: "realizada" | "em_andamento" | "cancelada"
      status_tarefa: "pendente" | "em_andamento" | "concluida" | "cancelada"
      status_tarefa_acao:
        | "nao_iniciada"
        | "em_andamento"
        | "concluida"
        | "atrasada"
      status_visita: "a_agendar" | "agendada" | "realizada" | "cancelada"
      tipo_evento: "reuniao" | "follow_up" | "apresentacao" | "visita" | "outro"
      tipo_modelo_proposta:
        | "alfandegada_fcl"
        | "alfandegada_lcl"
        | "alfandegada_fcl_lcl"
        | "break_bulk"
        | "exportacao"
        | "transporte"
        | "armazem_geral"
        | "aerea"
      tipo_ocorrencia:
        | "reclamacao"
        | "duvida"
        | "sugestao"
        | "problema_tecnico"
        | "outro"
      tipo_reuniao:
        | "comercial"
        | "operacional"
        | "qualidade"
        | "estrategica"
        | "crise"
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
      app_role: ["admin", "manager", "user", "adm"],
      area_envolvida: [
        "comercial",
        "inter_i_tps",
        "transporte",
        "cdex",
        "porto",
        "qualidade",
        "financeiro",
      ],
      impacto_acao: [
        "financeiro",
        "operacional",
        "relacionamento_cliente",
        "compliance",
      ],
      modalidade_visita: ["presencial", "remota"],
      prioridade_acao: ["baixa", "media", "alta", "urgente"],
      prioridade_acao_reuniao: ["alta", "media", "baixa"],
      prioridade_tarefa: ["baixa", "media", "alta", "urgente"],
      segmento_cliente: [
        "industrial",
        "comercial",
        "varejo",
        "tecnologia",
        "outros",
      ],
      status_acao: ["pendente", "em_andamento", "concluida", "cancelada"],
      status_acao_reuniao: [
        "nao_iniciada",
        "em_andamento",
        "concluida",
        "atrasada",
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
        "sem_retorno",
      ],
      status_proposta: ["rascunho", "enviada", "aprovada", "rejeitada"],
      status_reuniao: ["realizada", "em_andamento", "cancelada"],
      status_tarefa: ["pendente", "em_andamento", "concluida", "cancelada"],
      status_tarefa_acao: [
        "nao_iniciada",
        "em_andamento",
        "concluida",
        "atrasada",
      ],
      status_visita: ["a_agendar", "agendada", "realizada", "cancelada"],
      tipo_evento: ["reuniao", "follow_up", "apresentacao", "visita", "outro"],
      tipo_modelo_proposta: [
        "alfandegada_fcl",
        "alfandegada_lcl",
        "alfandegada_fcl_lcl",
        "break_bulk",
        "exportacao",
        "transporte",
        "armazem_geral",
        "aerea",
      ],
      tipo_ocorrencia: [
        "reclamacao",
        "duvida",
        "sugestao",
        "problema_tecnico",
        "outro",
      ],
      tipo_reuniao: [
        "comercial",
        "operacional",
        "qualidade",
        "estrategica",
        "crise",
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
