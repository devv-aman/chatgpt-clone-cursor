import type { UserRole, MessageRole } from '../constants/strings.js';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Message {
  id: string;
  chat_id: string;
  role: MessageRole;
  content: string;
  model_id: string | null;
  model_name: string | null;
  tokens_used: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type ProfileInsert = {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

export type ProfileUpdate = Partial<Omit<Profile, 'id'>>;

export type ChatInsert = {
  id?: string;
  user_id: string;
  title?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

export type ChatUpdate = Partial<Omit<Chat, 'id' | 'user_id'>>;

export type MessageInsert = {
  id?: string;
  chat_id: string;
  role: MessageRole;
  content: string;
  model_id?: string | null;
  model_name?: string | null;
  tokens_used?: number | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

export type MessageUpdate = Partial<Omit<Message, 'id' | 'chat_id'>>;

export interface UserSettings {
  id: string;
  user_id: string;
  openai_api_key_encrypted: string | null;
  openai_api_key_iv: string | null;
  openai_api_key_tag: string | null;
  created_at: string;
  updated_at: string;
}

export type UserSettingsInsert = {
  id?: string;
  user_id: string;
  openai_api_key_encrypted?: string | null;
  openai_api_key_iv?: string | null;
  openai_api_key_tag?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type UserSettingsUpdate = Partial<Omit<UserSettings, 'id' | 'user_id'>>;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      chats: {
        Row: Chat;
        Insert: ChatInsert;
        Update: ChatUpdate;
      };
      messages: {
        Row: Message;
        Insert: MessageInsert;
        Update: MessageUpdate;
      };
      user_settings: {
        Row: UserSettings;
        Insert: UserSettingsInsert;
        Update: UserSettingsUpdate;
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update'];
