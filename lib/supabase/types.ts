export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          user_id: string
          wa_number: string | null
          whapi_token: string | null
          plan: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          wa_number?: string | null
          whapi_token?: string | null
          plan?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          wa_number?: string | null
          whapi_token?: string | null
          plan?: string
          created_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          tenant_id: string
          wa_number: string
          display_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          wa_number: string
          display_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          wa_number?: string
          display_name?: string | null
          created_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          tenant_id: string
          client_id: string | null
          direction: string
          body: string | null
          raw_payload: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          client_id?: string | null
          direction: string
          body?: string | null
          raw_payload?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          client_id?: string | null
          direction?: string
          body?: string | null
          raw_payload?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          tenant_id: string
          client_id: string | null
          message_id: string | null
          type: string
          status: string
          urgency: string
          summary: string | null
          entities: Json
          reply_draft: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          client_id?: string | null
          message_id?: string | null
          type: string
          status?: string
          urgency?: string
          summary?: string | null
          entities?: Json
          reply_draft?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          client_id?: string | null
          message_id?: string | null
          type?: string
          status?: string
          urgency?: string
          summary?: string | null
          entities?: Json
          reply_draft?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
