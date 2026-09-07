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
      about_section: {
        Row: {
          content: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          id?: string
          title?: string
          updated_at?: string
        }
        Update: {
          content?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          read: boolean
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          read?: boolean
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          read?: boolean
          subject?: string | null
        }
        Relationships: []
      }
      hero_section: {
        Row: {
          cta_text: string
          headline: string
          id: string
          subheadline: string
          updated_at: string
        }
        Insert: {
          cta_text?: string
          headline?: string
          id?: string
          subheadline?: string
          updated_at?: string
        }
        Update: {
          cta_text?: string
          headline?: string
          id?: string
          subheadline?: string
          updated_at?: string
        }
        Relationships: []
      }
      link_copies: {
        Row: {
          category_slug: string | null
          created_at: string
          id: string
          subcategory_slug: string | null
          url: string
          username: string | null
        }
        Insert: {
          category_slug?: string | null
          created_at?: string
          id?: string
          subcategory_slug?: string | null
          url: string
          username?: string | null
        }
        Update: {
          category_slug?: string | null
          created_at?: string
          id?: string
          subcategory_slug?: string | null
          url?: string
          username?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          category_slug: string | null
          created_at: string
          id: string
          path: string
          referrer: string | null
          source: string
          subcategory_slug: string | null
          username: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          visitor_id: string | null
        }
        Insert: {
          category_slug?: string | null
          created_at?: string
          id?: string
          path: string
          referrer?: string | null
          source?: string
          subcategory_slug?: string | null
          username?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visitor_id?: string | null
        }
        Update: {
          category_slug?: string | null
          created_at?: string
          id?: string
          path?: string
          referrer?: string | null
          source?: string
          subcategory_slug?: string | null
          username?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          aspect_ratio: string
          category: string | null
          category_slug: string | null
          category_tags: Json
          client_name: string | null
          created_at: string
          description: string | null
          featured: boolean
          full_video_url: string | null
          id: string
          preview_seconds: number
          sort_order: number
          subcategory_slug: string | null
          thumbnail_url: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          aspect_ratio?: string
          category?: string | null
          category_slug?: string | null
          category_tags?: Json
          client_name?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          full_video_url?: string | null
          id?: string
          preview_seconds?: number
          sort_order?: number
          subcategory_slug?: string | null
          thumbnail_url?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          aspect_ratio?: string
          category?: string | null
          category_slug?: string | null
          category_tags?: Json
          client_name?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          full_video_url?: string | null
          id?: string
          preview_seconds?: number
          sort_order?: number
          subcategory_slug?: string | null
          thumbnail_url?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      site_layouts: {
        Row: {
          active: boolean
          created_at: string
          display_name: string
          hero_media_type: string
          hero_media_url: string | null
          id: string
          tagline: string | null
          theme: string
          updated_at: string
          username: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_name: string
          hero_media_type?: string
          hero_media_url?: string | null
          id?: string
          tagline?: string | null
          theme?: string
          updated_at?: string
          username: string
        }
        Update: {
          active?: boolean
          created_at?: string
          display_name?: string
          hero_media_type?: string
          hero_media_url?: string | null
          id?: string
          tagline?: string | null
          theme?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      tech_stack: {
        Row: {
          created_at: string
          description: string | null
          icon_url: string | null
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          client_avatar: string | null
          client_name: string
          client_title: string | null
          content: string
          created_at: string
          id: string
          rating: number | null
          sort_order: number
        }
        Insert: {
          client_avatar?: string | null
          client_name: string
          client_title?: string | null
          content: string
          created_at?: string
          id?: string
          rating?: number | null
          sort_order?: number
        }
        Update: {
          client_avatar?: string | null
          client_name?: string
          client_title?: string | null
          content?: string
          created_at?: string
          id?: string
          rating?: number | null
          sort_order?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_clicks: {
        Row: {
          created_at: string
          id: string
          item_id: string | null
          title: string | null
          username: string | null
          visitor_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_id?: string | null
          title?: string | null
          username?: string | null
          visitor_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string | null
          title?: string | null
          username?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_clicks_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "portfolio_items"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
