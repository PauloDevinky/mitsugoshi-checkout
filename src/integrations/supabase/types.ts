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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      gateway_settings: {
        Row: {
          api_key: string
          created_at: string
          gateway_name: string
          id: string
          is_active: boolean | null
          updated_at: string
        }
        Insert: {
          api_key?: string
          created_at?: string
          gateway_name?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Update: {
          api_key?: string
          created_at?: string
          gateway_name?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string | null
          id: string
          ip_address: string | null
          name: string
          product_id: string | null
          recovered: boolean | null
          step_abandoned: number | null
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          whatsapp: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: string | null
          name: string
          product_id?: string | null
          recovered?: boolean | null
          step_abandoned?: number | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          whatsapp: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: string | null
          name?: string
          product_id?: string | null
          recovered?: boolean | null
          step_abandoned?: number | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          created_at: string
          custom_domain: string | null
          dashboard_banner_url: string | null
          id: string
          page_title: string | null
          platform_logo_url: string | null
          platform_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_domain?: string | null
          dashboard_banner_url?: string | null
          id?: string
          page_title?: string | null
          platform_logo_url?: string | null
          platform_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_domain?: string | null
          dashboard_banner_url?: string | null
          id?: string
          page_title?: string | null
          platform_logo_url?: string | null
          platform_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          checkout_banner_url: string | null
          checkout_bg_color: string | null
          checkout_color: string | null
          checkout_footer_text: string | null
          checkout_logo_url: string | null
          checkout_reviews: Json | null
          checkout_security_badges: Json | null
          checkout_show_security_badges: boolean | null
          checkout_show_social_proof: boolean | null
          checkout_show_timer: boolean | null
          checkout_social_proof_count: number | null
          checkout_template: string | null
          checkout_timer_bg_color: string | null
          checkout_timer_minutes: number | null
          checkout_timer_text_color: string | null
          checkout_urgency_text: string | null
          created_at: string
          fake_recurrence: boolean | null
          ghost_shipping: number | null
          id: string
          image_url: string | null
          is_subscription: boolean | null
          name: string
          order_bump_id: string | null
          order_bumps: Json | null
          price_original: number
          price_sale: number
          shipping_options: Json | null
          slug: string
          status: string | null
          subscription_interval: string | null
          tiktok_access_token: string | null
          tiktok_pixel_id: string | null
          updated_at: string
        }
        Insert: {
          checkout_banner_url?: string | null
          checkout_bg_color?: string | null
          checkout_color?: string | null
          checkout_footer_text?: string | null
          checkout_logo_url?: string | null
          checkout_reviews?: Json | null
          checkout_security_badges?: Json | null
          checkout_show_security_badges?: boolean | null
          checkout_show_social_proof?: boolean | null
          checkout_show_timer?: boolean | null
          checkout_social_proof_count?: number | null
          checkout_template?: string | null
          checkout_timer_bg_color?: string | null
          checkout_timer_minutes?: number | null
          checkout_timer_text_color?: string | null
          checkout_urgency_text?: string | null
          created_at?: string
          fake_recurrence?: boolean | null
          ghost_shipping?: number | null
          id?: string
          image_url?: string | null
          is_subscription?: boolean | null
          name: string
          order_bump_id?: string | null
          order_bumps?: Json | null
          price_original?: number
          price_sale?: number
          shipping_options?: Json | null
          slug: string
          status?: string | null
          subscription_interval?: string | null
          tiktok_access_token?: string | null
          tiktok_pixel_id?: string | null
          updated_at?: string
        }
        Update: {
          checkout_banner_url?: string | null
          checkout_bg_color?: string | null
          checkout_color?: string | null
          checkout_footer_text?: string | null
          checkout_logo_url?: string | null
          checkout_reviews?: Json | null
          checkout_security_badges?: Json | null
          checkout_show_security_badges?: boolean | null
          checkout_show_social_proof?: boolean | null
          checkout_show_timer?: boolean | null
          checkout_social_proof_count?: number | null
          checkout_template?: string | null
          checkout_timer_bg_color?: string | null
          checkout_timer_minutes?: number | null
          checkout_timer_text_color?: string | null
          checkout_urgency_text?: string | null
          created_at?: string
          fake_recurrence?: boolean | null
          ghost_shipping?: number | null
          id?: string
          image_url?: string | null
          is_subscription?: boolean | null
          name?: string
          order_bump_id?: string | null
          order_bumps?: Json | null
          price_original?: number
          price_sale?: number
          shipping_options?: Json | null
          slug?: string
          status?: string | null
          subscription_interval?: string | null
          tiktok_access_token?: string | null
          tiktok_pixel_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_order_bump_id_fkey"
            columns: ["order_bump_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_whatsapp: string | null
          gateway: string | null
          id: string
          lead_id: string | null
          payment_method: string | null
          pix_code: string | null
          pix_qr_url: string | null
          product_id: string | null
          status: string | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          webhook_sent: boolean | null
          webhook_url: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_whatsapp?: string | null
          gateway?: string | null
          id?: string
          lead_id?: string | null
          payment_method?: string | null
          pix_code?: string | null
          pix_qr_url?: string | null
          product_id?: string | null
          status?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          webhook_sent?: boolean | null
          webhook_url?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_whatsapp?: string | null
          gateway?: string | null
          id?: string
          lead_id?: string | null
          payment_method?: string | null
          pix_code?: string | null
          pix_qr_url?: string | null
          product_id?: string | null
          status?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          webhook_sent?: boolean | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
      webhooks: {
        Row: {
          created_at: string
          events: string[] | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          name: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          events?: string[] | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          events?: string[] | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
