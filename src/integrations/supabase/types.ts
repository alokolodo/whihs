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
      account_categories: {
        Row: {
          account_code: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          parent_category_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          account_code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          parent_category_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          account_code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          parent_category_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "account_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      account_entries: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          credit_amount: number | null
          debit_amount: number | null
          description: string
          entry_date: string
          id: string
          notes: string | null
          posted_at: string | null
          posted_by: string | null
          reference_number: string | null
          source_id: string | null
          source_type: string | null
          status: string
          sub_category: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          credit_amount?: number | null
          debit_amount?: number | null
          description: string
          entry_date?: string
          id?: string
          notes?: string | null
          posted_at?: string | null
          posted_by?: string | null
          reference_number?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string
          sub_category?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string
          entry_date?: string
          id?: string
          notes?: string | null
          posted_at?: string | null
          posted_by?: string | null
          reference_number?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string
          sub_category?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_entries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "account_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          actual_amount: number | null
          budgeted_amount: number
          category_id: string | null
          created_at: string
          fiscal_year: number
          id: string
          name: string
          period_number: number | null
          period_type: string
          status: string
          updated_at: string
          variance: number | null
          variance_percentage: number | null
        }
        Insert: {
          actual_amount?: number | null
          budgeted_amount: number
          category_id?: string | null
          created_at?: string
          fiscal_year: number
          id?: string
          name: string
          period_number?: number | null
          period_type?: string
          status?: string
          updated_at?: string
          variance?: number | null
          variance_percentage?: number | null
        }
        Update: {
          actual_amount?: number | null
          budgeted_amount?: number
          category_id?: string | null
          created_at?: string
          fiscal_year?: number
          id?: string
          name?: string
          period_number?: number | null
          period_type?: string
          status?: string
          updated_at?: string
          variance?: number | null
          variance_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "account_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_reports: {
        Row: {
          created_at: string
          generated_at: string
          generated_by: string | null
          id: string
          period_end: string
          period_start: string
          report_data: Json
          report_type: string
        }
        Insert: {
          created_at?: string
          generated_at?: string
          generated_by?: string | null
          id?: string
          period_end: string
          period_start: string
          report_data: Json
          report_type: string
        }
        Update: {
          created_at?: string
          generated_at?: string
          generated_by?: string | null
          id?: string
          period_end?: string
          period_start?: string
          report_data?: Json
          report_type?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          category: string
          cost_per_unit: number
          created_at: string
          current_quantity: number
          id: string
          item_name: string
          last_restocked: string | null
          max_threshold: number
          min_threshold: number
          supplier: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          category: string
          cost_per_unit?: number
          created_at?: string
          current_quantity?: number
          id?: string
          item_name: string
          last_restocked?: string | null
          max_threshold?: number
          min_threshold?: number
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          category?: string
          cost_per_unit?: number
          created_at?: string
          current_quantity?: number
          id?: string
          item_name?: string
          last_restocked?: string | null
          max_threshold?: number
          min_threshold?: number
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      kitchen_orders: {
        Row: {
          created_at: string
          estimated_time: number | null
          guest_name: string
          id: string
          items: Json
          order_id: string
          priority: number
          status: string
          table_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          estimated_time?: number | null
          guest_name: string
          id?: string
          items: Json
          order_id: string
          priority?: number
          status?: string
          table_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          estimated_time?: number | null
          guest_name?: string
          id?: string
          items?: Json
          order_id?: string
          priority?: number
          status?: string
          table_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kitchen_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          item_category: string
          item_name: string
          order_id: string
          price: number
          quantity: number
          special_instructions: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_category: string
          item_name: string
          order_id: string
          price: number
          quantity?: number
          special_instructions?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_category?: string
          item_name?: string
          order_id?: string
          price?: number
          quantity?: number
          special_instructions?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          guest_name: string
          guest_type: string
          id: string
          payment_method: string | null
          room_number: string | null
          status: string
          subtotal: number
          table_id: string | null
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          guest_name: string
          guest_type: string
          id?: string
          payment_method?: string | null
          room_number?: string | null
          status?: string
          subtotal?: number
          table_id?: string | null
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          guest_name?: string
          guest_type?: string
          id?: string
          payment_method?: string | null
          room_number?: string | null
          status?: string
          subtotal?: number
          table_id?: string | null
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_tables: {
        Row: {
          created_at: string
          id: string
          seats: number
          status: string
          table_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          seats?: number
          status?: string
          table_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          seats?: number
          status?: string
          table_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      supplier_order_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          item_name: string
          order_id: string
          quantity: number
          total_price: number
          unit: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          item_name: string
          order_id: string
          quantity: number
          total_price: number
          unit?: string
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          item_name?: string
          order_id?: string
          quantity?: number
          total_price?: number
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "supplier_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "supplier_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_orders: {
        Row: {
          created_at: string
          created_by: string | null
          delivery_date: string | null
          expected_delivery_date: string | null
          id: string
          notes: string | null
          order_date: string
          order_number: string
          status: string
          supplier_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          delivery_date?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number: string
          status?: string
          supplier_id: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          delivery_date?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number?: string
          status?: string
          supplier_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          order_id: string | null
          payment_date: string
          payment_method: string
          reference_number: string | null
          status: string
          supplier_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          payment_date?: string
          payment_method: string
          reference_number?: string | null
          status?: string
          supplier_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          payment_date?: string
          payment_method?: string
          reference_number?: string | null
          status?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "supplier_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_payments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string
          category: string
          contact_person: string
          created_at: string
          email: string
          id: string
          last_order_date: string | null
          name: string
          payment_terms: string | null
          phone: string
          rating: number | null
          status: string
          tax_id: string | null
          total_amount: number | null
          total_orders: number | null
          updated_at: string
        }
        Insert: {
          address: string
          category: string
          contact_person: string
          created_at?: string
          email: string
          id?: string
          last_order_date?: string | null
          name: string
          payment_terms?: string | null
          phone: string
          rating?: number | null
          status?: string
          tax_id?: string | null
          total_amount?: number | null
          total_orders?: number | null
          updated_at?: string
        }
        Update: {
          address?: string
          category?: string
          contact_person?: string
          created_at?: string
          email?: string
          id?: string
          last_order_date?: string | null
          name?: string
          payment_terms?: string | null
          phone?: string
          rating?: number | null
          status?: string
          tax_id?: string | null
          total_amount?: number | null
          total_orders?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_inventory_quantity: {
        Args: { item_name_param: string; quantity_change: number }
        Returns: undefined
      }
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
