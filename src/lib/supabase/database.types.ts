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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          created_at: string
          id: string
          name: string
          short_code: string
          warehouse_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          short_code: string
          warehouse_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          short_code?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          contact: string | null
          created_at: string
          id: string
          name: string
          type: string
        }
        Insert: {
          contact?: string | null
          created_at?: string
          id?: string
          name: string
          type: string
        }
        Update: {
          contact?: string | null
          created_at?: string
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          reorder_level: number
          reorder_qty: number
          sku: string
          unit_cost: number
          uom: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          reorder_level?: number
          reorder_qty?: number
          sku: string
          unit_cost?: number
          uom?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          reorder_level?: number
          reorder_qty?: number
          sku?: string
          unit_cost?: number
          uom?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_lines: {
        Row: {
          delivery_id: string
          id: string
          product_id: string
          qty: number
        }
        Insert: {
          delivery_id: string
          id?: string
          product_id: string
          qty: number
        }
        Update: {
          delivery_id?: string
          id?: string
          product_id?: string
          qty?: number
        }
        Relationships: [
          {
            foreignKeyName: "delivery_lines_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      deliveries: {
        Row: {
          created_at: string
          id: string
          partner_id: string | null
          reference: string
          responsible_id: string | null
          scheduled_date: string
          source_location_id: string
          status: string
          validated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          partner_id?: string | null
          reference?: string
          responsible_id?: string | null
          scheduled_date?: string
          source_location_id: string
          status?: string
          validated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          partner_id?: string | null
          reference?: string
          responsible_id?: string | null
          scheduled_date?: string
          source_location_id?: string
          status?: string
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_source_location_id_fkey"
            columns: ["source_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      receipt_lines: {
        Row: {
          id: string
          product_id: string
          qty: number
          receipt_id: string
          unit_cost: number
        }
        Insert: {
          id?: string
          product_id: string
          qty: number
          receipt_id: string
          unit_cost?: number
        }
        Update: {
          id?: string
          product_id?: string
          qty?: number
          receipt_id?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "receipt_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipt_lines_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          created_at: string
          destination_location_id: string
          id: string
          partner_id: string | null
          reference: string
          responsible_id: string | null
          scheduled_date: string
          status: string
          validated_at: string | null
        }
        Insert: {
          created_at?: string
          destination_location_id: string
          id?: string
          partner_id?: string | null
          reference?: string
          responsible_id?: string | null
          scheduled_date?: string
          status?: string
          validated_at?: string | null
        }
        Update: {
          created_at?: string
          destination_location_id?: string
          id?: string
          partner_id?: string | null
          reference?: string
          responsible_id?: string | null
          scheduled_date?: string
          status?: string
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receipts_destination_location_id_fkey"
            columns: ["destination_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_balances: {
        Row: {
          location_id: string
          on_hand: number
          product_id: string
          updated_at: string
        }
        Insert: {
          location_id: string
          on_hand?: number
          product_id: string
          updated_at?: string
        }
        Update: {
          location_id?: string
          on_hand?: number
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_balances_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_balances_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_ledger: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          location_id: string
          movement_type: string
          product_id: string
          qty_after: number
          qty_before: number
          qty_delta: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
          related_location_id: string | null
          unit_cost_snapshot: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          location_id: string
          movement_type: string
          product_id: string
          qty_after: number
          qty_before: number
          qty_delta: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          related_location_id?: string | null
          unit_cost_snapshot?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          location_id?: string
          movement_type?: string
          product_id?: string
          qty_after?: number
          qty_before?: number
          qty_delta?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          related_location_id?: string | null
          unit_cost_snapshot?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_ledger_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_ledger_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_ledger_related_location_id_fkey"
            columns: ["related_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          short_code: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          short_code: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          short_code?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_stock_movement: {
        Args: {
          p_created_by?: string
          p_location_id: string
          p_movement_type: string
          p_product_id: string
          p_qty_delta: number
          p_reason?: string
          p_reference_id?: string
          p_reference_type?: string
          p_related_location_id?: string
          p_unit_cost?: number
        }
        Returns: {
          created_at: string
          created_by: string | null
          id: string
          location_id: string
          movement_type: string
          product_id: string
          qty_after: number
          qty_before: number
          qty_delta: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
          related_location_id: string | null
          unit_cost_snapshot: number | null
        }
      }
      validate_delivery: {
        Args: { p_delivery_id: string; p_user_id: string }
        Returns: {
          created_at: string
          id: string
          partner_id: string | null
          reference: string
          responsible_id: string | null
          scheduled_date: string
          source_location_id: string
          status: string
          validated_at: string | null
        }
      }
      validate_receipt: {
        Args: { p_receipt_id: string; p_user_id: string }
        Returns: {
          created_at: string
          destination_location_id: string
          id: string
          partner_id: string | null
          reference: string
          responsible_id: string | null
          scheduled_date: string
          status: string
          validated_at: string | null
        }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
