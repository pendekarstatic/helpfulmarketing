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
      data_sources: {
        Row: {
          cached_data: Json | null
          column_mapping: Json | null
          config: Json
          created_at: string
          id: string
          last_synced_at: string | null
          name: string
          project_id: string
          source_type: Database["public"]["Enums"]["data_source_type"]
          updated_at: string
        }
        Insert: {
          cached_data?: Json | null
          column_mapping?: Json | null
          config?: Json
          created_at?: string
          id?: string
          last_synced_at?: string | null
          name: string
          project_id: string
          source_type: Database["public"]["Enums"]["data_source_type"]
          updated_at?: string
        }
        Update: {
          cached_data?: Json | null
          column_mapping?: Json | null
          config?: Json
          created_at?: string
          id?: string
          last_synced_at?: string | null
          name?: string
          project_id?: string
          source_type?: Database["public"]["Enums"]["data_source_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_sources_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          created_at: string
          data: Json
          data_overrides: Json | null
          generated_html: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          og_image_url: string | null
          project_id: string
          schema_markup: Json | null
          slug: string
          status: Database["public"]["Enums"]["page_status"]
          template_id: string | null
          title: string
          updated_at: string
          url_path: string | null
        }
        Insert: {
          created_at?: string
          data?: Json
          data_overrides?: Json | null
          generated_html?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          project_id: string
          schema_markup?: Json | null
          slug: string
          status?: Database["public"]["Enums"]["page_status"]
          template_id?: string | null
          title: string
          updated_at?: string
          url_path?: string | null
        }
        Update: {
          created_at?: string
          data?: Json
          data_overrides?: Json | null
          generated_html?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          project_id?: string
          schema_markup?: Json | null
          slug?: string
          status?: Database["public"]["Enums"]["page_status"]
          template_id?: string | null
          title?: string
          updated_at?: string
          url_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          ai_model: string | null
          analytics_code: string | null
          brand_guidelines: string | null
          created_at: string
          custom_domain: string | null
          favicon_url: string | null
          font_family: string | null
          footer_content: string | null
          header_content: string | null
          id: string
          is_archived: boolean
          logo_url: string | null
          mode: Database["public"]["Enums"]["project_mode"]
          name: string
          og_image_url: string | null
          openrouter_api_key: string | null
          primary_color: string | null
          robots_txt: string | null
          secondary_color: string | null
          site_name: string | null
          sitemap_max_urls: number | null
          sitemap_separate: boolean | null
          slug: string | null
          split_assets: boolean | null
          straico_api_key: string | null
          theme: string | null
          updated_at: string
          url_format: string | null
          use_header_footer: boolean | null
          user_id: string
        }
        Insert: {
          ai_model?: string | null
          analytics_code?: string | null
          brand_guidelines?: string | null
          created_at?: string
          custom_domain?: string | null
          favicon_url?: string | null
          font_family?: string | null
          footer_content?: string | null
          header_content?: string | null
          id?: string
          is_archived?: boolean
          logo_url?: string | null
          mode?: Database["public"]["Enums"]["project_mode"]
          name: string
          og_image_url?: string | null
          openrouter_api_key?: string | null
          primary_color?: string | null
          robots_txt?: string | null
          secondary_color?: string | null
          site_name?: string | null
          sitemap_max_urls?: number | null
          sitemap_separate?: boolean | null
          slug?: string | null
          split_assets?: boolean | null
          straico_api_key?: string | null
          theme?: string | null
          updated_at?: string
          url_format?: string | null
          use_header_footer?: boolean | null
          user_id: string
        }
        Update: {
          ai_model?: string | null
          analytics_code?: string | null
          brand_guidelines?: string | null
          created_at?: string
          custom_domain?: string | null
          favicon_url?: string | null
          font_family?: string | null
          footer_content?: string | null
          header_content?: string | null
          id?: string
          is_archived?: boolean
          logo_url?: string | null
          mode?: Database["public"]["Enums"]["project_mode"]
          name?: string
          og_image_url?: string | null
          openrouter_api_key?: string | null
          primary_color?: string | null
          robots_txt?: string | null
          secondary_color?: string | null
          site_name?: string | null
          sitemap_max_urls?: number | null
          sitemap_separate?: boolean | null
          slug?: string | null
          split_assets?: boolean | null
          straico_api_key?: string | null
          theme?: string | null
          updated_at?: string
          url_format?: string | null
          use_header_footer?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          combo_columns: Json | null
          created_at: string
          css_content: string | null
          filter_rules: Json | null
          generation_mode: string
          html_content: string
          id: string
          is_builtin: boolean
          meta_description_pattern: string | null
          meta_title_pattern: string | null
          name: string
          project_id: string | null
          schema_type: string | null
          split_column: string | null
          template_type: Database["public"]["Enums"]["template_type"]
          updated_at: string
          url_pattern: string | null
          user_id: string
          version: number
        }
        Insert: {
          combo_columns?: Json | null
          created_at?: string
          css_content?: string | null
          filter_rules?: Json | null
          generation_mode?: string
          html_content?: string
          id?: string
          is_builtin?: boolean
          meta_description_pattern?: string | null
          meta_title_pattern?: string | null
          name: string
          project_id?: string | null
          schema_type?: string | null
          split_column?: string | null
          template_type?: Database["public"]["Enums"]["template_type"]
          updated_at?: string
          url_pattern?: string | null
          user_id: string
          version?: number
        }
        Update: {
          combo_columns?: Json | null
          created_at?: string
          css_content?: string | null
          filter_rules?: Json | null
          generation_mode?: string
          html_content?: string
          id?: string
          is_builtin?: boolean
          meta_description_pattern?: string | null
          meta_title_pattern?: string | null
          name?: string
          project_id?: string | null
          schema_type?: string | null
          split_column?: string | null
          template_type?: Database["public"]["Enums"]["template_type"]
          updated_at?: string
          url_pattern?: string | null
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "templates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          id: string
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          settings?: Json
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
      data_source_type:
        | "csv"
        | "published_url"
        | "google_oauth"
        | "apps_script_webhook"
      page_status: "draft" | "published" | "archived"
      project_mode: "pseo" | "directory" | "hybrid"
      template_type:
        | "listing_detail"
        | "category_page"
        | "search_results"
        | "location_page"
        | "best_x_in_y"
        | "comparison"
        | "glossary"
        | "custom"
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
      data_source_type: [
        "csv",
        "published_url",
        "google_oauth",
        "apps_script_webhook",
      ],
      page_status: ["draft", "published", "archived"],
      project_mode: ["pseo", "directory", "hybrid"],
      template_type: [
        "listing_detail",
        "category_page",
        "search_results",
        "location_page",
        "best_x_in_y",
        "comparison",
        "glossary",
        "custom",
      ],
    },
  },
} as const
