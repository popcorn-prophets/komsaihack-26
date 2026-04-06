export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      account_invites: {
        Row: {
          accepted_at: string | null;
          accepted_user_id: string | null;
          claim_expires_at: string | null;
          created_at: string;
          email: string;
          expires_at: string | null;
          id: string;
          invited_by: string;
          revoked_at: string | null;
          role: Database['public']['Enums']['app_role'];
          token_hash: string;
          updated_at: string;
        };
        Insert: {
          accepted_at?: string | null;
          accepted_user_id?: string | null;
          claim_expires_at?: string | null;
          created_at?: string;
          email: string;
          expires_at?: string | null;
          id?: string;
          invited_by: string;
          revoked_at?: string | null;
          role: Database['public']['Enums']['app_role'];
          token_hash: string;
          updated_at?: string;
        };
        Update: {
          accepted_at?: string | null;
          accepted_user_id?: string | null;
          claim_expires_at?: string | null;
          created_at?: string;
          email?: string;
          expires_at?: string | null;
          id?: string;
          invited_by?: string;
          revoked_at?: string | null;
          role?: Database['public']['Enums']['app_role'];
          token_hash?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      advisories: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          message: string;
          title: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          message: string;
          title: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          message?: string;
          title?: string;
        };
        Relationships: [];
      };
      advisory_recipients: {
        Row: {
          advisory_id: string;
          delivered_at: string | null;
          id: string;
          resident_id: string;
        };
        Insert: {
          advisory_id: string;
          delivered_at?: string | null;
          id?: string;
          resident_id: string;
        };
        Update: {
          advisory_id?: string;
          delivered_at?: string | null;
          id?: string;
          resident_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'advisory_recipients_advisory_id_fkey';
            columns: ['advisory_id'];
            isOneToOne: false;
            referencedRelation: 'advisories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'advisory_recipients_resident_id_fkey';
            columns: ['resident_id'];
            isOneToOne: false;
            referencedRelation: 'residents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'advisory_recipients_resident_id_fkey';
            columns: ['resident_id'];
            isOneToOne: false;
            referencedRelation: 'residents_with_coords';
            referencedColumns: ['id'];
          },
        ];
      };
      advisory_templates: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          message: string;
          name: string;
          title: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          message: string;
          name: string;
          title: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          message?: string;
          name?: string;
          title?: string;
        };
        Relationships: [];
      };
      incident_types: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      incidents: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          incident_time: string;
          incident_type_id: string;
          location: unknown;
          location_description: string | null;
          reported_by: string | null;
          severity: Database['public']['Enums']['incident_severity'];
          status: Database['public']['Enums']['incident_status'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          incident_time?: string;
          incident_type_id: string;
          location?: unknown;
          location_description?: string | null;
          reported_by?: string | null;
          severity: Database['public']['Enums']['incident_severity'];
          status?: Database['public']['Enums']['incident_status'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          incident_time?: string;
          incident_type_id?: string;
          location?: unknown;
          location_description?: string | null;
          reported_by?: string | null;
          severity?: Database['public']['Enums']['incident_severity'];
          status?: Database['public']['Enums']['incident_status'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'incidents_incident_type_id_fkey';
            columns: ['incident_type_id'];
            isOneToOne: false;
            referencedRelation: 'incident_types';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'incidents_reported_by_fkey';
            columns: ['reported_by'];
            isOneToOne: false;
            referencedRelation: 'residents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'incidents_reported_by_fkey';
            columns: ['reported_by'];
            isOneToOne: false;
            referencedRelation: 'residents_with_coords';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      residents: {
        Row: {
          created_at: string;
          id: string;
          language: Database['public']['Enums']['resident_language'];
          location: unknown;
          name: string;
          platform: Database['public']['Enums']['resident_platform'];
          platform_user_id: string;
          thread_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          language?: Database['public']['Enums']['resident_language'];
          location: unknown;
          name: string;
          platform: Database['public']['Enums']['resident_platform'];
          platform_user_id: string;
          thread_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          language?: Database['public']['Enums']['resident_language'];
          location?: unknown;
          name?: string;
          platform?: Database['public']['Enums']['resident_platform'];
          platform_user_id?: string;
          thread_id?: string;
        };
        Relationships: [];
      };
      role_assignments: {
        Row: {
          created_at: string;
          id: number;
          role: Database['public']['Enums']['app_role'];
          scope_id: string | null;
          scope_type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: never;
          role: Database['public']['Enums']['app_role'];
          scope_id?: string | null;
          scope_type?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: never;
          role?: Database['public']['Enums']['app_role'];
          scope_id?: string | null;
          scope_type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'role_assignments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      incidents_with_details: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string | null;
          incident_time: string | null;
          incident_type_id: string | null;
          incident_type_name: string | null;
          latitude: number | null;
          location_description: string | null;
          longitude: number | null;
          reported_by: string | null;
          reporter_name: string | null;
          reporter_platform:
            | Database['public']['Enums']['resident_platform']
            | null;
          reporter_thread_id: string | null;
          severity: Database['public']['Enums']['incident_severity'] | null;
          status: Database['public']['Enums']['incident_status'] | null;
          updated_at: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'incidents_incident_type_id_fkey';
            columns: ['incident_type_id'];
            isOneToOne: false;
            referencedRelation: 'incident_types';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'incidents_reported_by_fkey';
            columns: ['reported_by'];
            isOneToOne: false;
            referencedRelation: 'residents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'incidents_reported_by_fkey';
            columns: ['reported_by'];
            isOneToOne: false;
            referencedRelation: 'residents_with_coords';
            referencedColumns: ['id'];
          },
        ];
      };
      residents_with_coords: {
        Row: {
          created_at: string | null;
          id: string | null;
          language: Database['public']['Enums']['resident_language'] | null;
          latitude: number | null;
          longitude: number | null;
          name: string | null;
          platform: Database['public']['Enums']['resident_platform'] | null;
          platform_user_id: string | null;
          thread_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string | null;
          language?: Database['public']['Enums']['resident_language'] | null;
          latitude?: never;
          longitude?: never;
          name?: string | null;
          platform?: Database['public']['Enums']['resident_platform'] | null;
          platform_user_id?: string | null;
          thread_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string | null;
          language?: Database['public']['Enums']['resident_language'] | null;
          latitude?: never;
          longitude?: never;
          name?: string | null;
          platform?: Database['public']['Enums']['resident_platform'] | null;
          platform_user_id?: string | null;
          thread_id?: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      bootstrap_registration_open: { Args: never; Returns: boolean };
      claim_account_invite: {
        Args: { target_token_hash: string };
        Returns: {
          email: string;
          expires_at: string;
          id: string;
          role: Database['public']['Enums']['app_role'];
        }[];
      };
      claim_bootstrap_admin: {
        Args: { target_email: string };
        Returns: boolean;
      };
      complete_account_invite: {
        Args: { target_token_hash: string; target_user_id: string };
        Returns: {
          email: string;
          id: string;
          role: Database['public']['Enums']['app_role'];
        }[];
      };
      has_any_role: {
        Args: {
          target_roles: Database['public']['Enums']['app_role'][];
          target_scope_id?: string;
          target_scope_type?: string;
        };
        Returns: boolean;
      };
      has_role: {
        Args: {
          target_role: Database['public']['Enums']['app_role'];
          target_scope_id?: string;
          target_scope_type?: string;
        };
        Returns: boolean;
      };
      is_admin_or_above: { Args: never; Returns: boolean };
      is_responder_or_above: { Args: never; Returns: boolean };
      release_account_invite_claim: {
        Args: { target_token_hash: string };
        Returns: undefined;
      };
      release_bootstrap_admin_claim: {
        Args: { target_email: string };
        Returns: undefined;
      };
      residents_within_polygon: {
        Args: { target_polygon: Json };
        Returns: {
          id: string;
          platform: Database['public']['Enums']['resident_platform'];
          thread_id: string;
        }[];
      };
      set_staff_role: {
        Args: {
          target_role: Database['public']['Enums']['app_role'];
          target_user_id: string;
        };
        Returns: {
          role: Database['public']['Enums']['app_role'];
          user_id: string;
        }[];
      };
    };
    Enums: {
      app_role: 'super_admin' | 'admin' | 'responder';
      incident_severity: 'low' | 'moderate' | 'high' | 'critical';
      incident_status:
        | 'new'
        | 'validated'
        | 'in_progress'
        | 'resolved'
        | 'dismissed';
      resident_language: 'eng' | 'fil' | 'hil';
      resident_platform: 'telegram' | 'messenger';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ['super_admin', 'admin', 'responder'],
      incident_severity: ['low', 'moderate', 'high', 'critical'],
      incident_status: [
        'new',
        'validated',
        'in_progress',
        'resolved',
        'dismissed',
      ],
      resident_language: ['eng', 'fil', 'hil'],
      resident_platform: ['telegram', 'messenger'],
    },
  },
} as const;
