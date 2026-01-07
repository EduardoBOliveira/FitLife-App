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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      alimentos: {
        Row: {
          created_at: string
          id: string
          nome: string
          observacoes: string | null
          quantidade: string
          refeicao_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          observacoes?: string | null
          quantidade: string
          refeicao_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          observacoes?: string | null
          quantidade?: string
          refeicao_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alimentos_refeicao_id_fkey"
            columns: ["refeicao_id"]
            isOneToOne: false
            referencedRelation: "refeicoes"
            referencedColumns: ["id"]
          },
        ]
      }
      dietas: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exercicios: {
        Row: {
          carga_planejada: number | null
          created_at: string
          id: string
          nome: string
          observacoes: string | null
          ordem: number
          repeticoes_planejadas: string
          series_planejadas: number
          treino_id: string
          updated_at: string
        }
        Insert: {
          carga_planejada?: number | null
          created_at?: string
          id?: string
          nome: string
          observacoes?: string | null
          ordem?: number
          repeticoes_planejadas: string
          series_planejadas: number
          treino_id: string
          updated_at?: string
        }
        Update: {
          carga_planejada?: number | null
          created_at?: string
          id?: string
          nome?: string
          observacoes?: string | null
          ordem?: number
          repeticoes_planejadas?: string
          series_planejadas?: number
          treino_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercicios_treino_id_fkey"
            columns: ["treino_id"]
            isOneToOne: false
            referencedRelation: "treinos"
            referencedColumns: ["id"]
          },
        ]
      }
      exercicios_historico: {
        Row: {
          carga_realizada: number
          created_at: string
          data_treino: string
          exercicio_id: string
          id: string
          observacoes: string | null
          repeticoes_realizadas: number
          series_realizadas: number
          user_id: string
        }
        Insert: {
          carga_realizada: number
          created_at?: string
          data_treino?: string
          exercicio_id: string
          id?: string
          observacoes?: string | null
          repeticoes_realizadas: number
          series_realizadas: number
          user_id: string
        }
        Update: {
          carga_realizada?: number
          created_at?: string
          data_treino?: string
          exercicio_id?: string
          id?: string
          observacoes?: string | null
          repeticoes_realizadas?: number
          series_realizadas?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercicios_historico_exercicio_id_fkey"
            columns: ["exercicio_id"]
            isOneToOne: false
            referencedRelation: "exercicios"
            referencedColumns: ["id"]
          },
        ]
      }
      habitos: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          notificacao: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          notificacao?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          notificacao?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      habitos_status: {
        Row: {
          created_at: string
          data: string
          habito_id: string
          id: string
          status: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: string
          habito_id: string
          id?: string
          status?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          habito_id?: string
          id?: string
          status?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habitos_status_habito_id_fkey"
            columns: ["habito_id"]
            isOneToOne: false
            referencedRelation: "habitos"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_peso: {
        Row: {
          created_at: string
          data: string
          id: string
          peso: number
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: string
          id?: string
          peso: number
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          peso?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          altura: number | null
          created_at: string
          id: string
          idade: number | null
          nome: string
          objetivo: string | null
          peso: number | null
          sexo: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          altura?: number | null
          created_at?: string
          id?: string
          idade?: number | null
          nome: string
          objetivo?: string | null
          peso?: number | null
          sexo?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          altura?: number | null
          created_at?: string
          id?: string
          idade?: number | null
          nome?: string
          objetivo?: string | null
          peso?: number | null
          sexo?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      refeicoes: {
        Row: {
          created_at: string
          dieta_id: string
          horario: string | null
          id: string
          nome_refeicao: string
          ordem: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          dieta_id: string
          horario?: string | null
          id?: string
          nome_refeicao: string
          ordem?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          dieta_id?: string
          horario?: string | null
          id?: string
          nome_refeicao?: string
          ordem?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refeicoes_dieta_id_fkey"
            columns: ["dieta_id"]
            isOneToOne: false
            referencedRelation: "dietas"
            referencedColumns: ["id"]
          },
        ]
      }
      refeicoes_status: {
        Row: {
          created_at: string
          data: string
          id: string
          refeicao_id: string
          status: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: string
          id?: string
          refeicao_id: string
          status?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          refeicao_id?: string
          status?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refeicoes_status_refeicao_id_fkey"
            columns: ["refeicao_id"]
            isOneToOne: false
            referencedRelation: "refeicoes"
            referencedColumns: ["id"]
          },
        ]
      }
      treinos: {
        Row: {
          ativo: boolean
          created_at: string
          dias_semana: number[]
          id: string
          nome: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          dias_semana?: number[]
          id?: string
          nome: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          dias_semana?: number[]
          id?: string
          nome?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
