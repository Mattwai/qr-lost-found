// Supabase client configuration and database service

import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import type { ItemData, Location } from "./config";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase environment variables not set. Database features will not work."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database service functions
export const db = {
  // Register a new item (requires authentication)
  async registerItem(itemData: Omit<ItemData, "id">): Promise<ItemData | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("User must be authenticated to register items");
        return null;
      }

      const { data, error } = await supabase
        .from("items")
        .insert([
          {
            user_id: user.id,
            qr_code: itemData.qr_code,
            name: itemData.name,
            owner_name: itemData.ownerName || null,
            owner_email: user.email || "",
            status: itemData.status,
            registered_at: itemData.registeredAt,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error registering item:", error);
        return null;
      }

      return this.mapDbToItem(data);
    } catch (error) {
      console.error("Exception registering item:", error);
      return null;
    }
  },

  // Get item by QR code
  async getItemByQrCode(qrCode: string): Promise<ItemData | null> {
    try {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("qr_code", qrCode)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows returned - item not found
          return null;
        }
        console.error("Error fetching item:", error);
        return null;
      }

      return this.mapDbToItem(data);
    } catch (error) {
      console.error("Exception fetching item:", error);
      return null;
    }
  },

  // Get all items for the current authenticated user
  async getCurrentUserItems(): Promise<ItemData[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("User must be authenticated to fetch items");
        return [];
      }

      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", user.id)
        .order("registered_at", { ascending: false });

      if (error) {
        console.error("Error fetching items:", error);
        return [];
      }

      return data.map((item) => this.mapDbToItem(item));
    } catch (error) {
      console.error("Exception fetching items:", error);
      return [];
    }
  },

  // Update item status
  async updateItemStatus(
    qrCode: string,
    status: ItemData["status"],
    additionalData?: {
      location?: Location;
      reportedFoundAt?: string;
      droppedOffAt?: string;
      pickedUpAt?: string;
      expiresAt?: string;
    }
  ): Promise<ItemData | null> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (additionalData?.location) {
        updateData.location = additionalData.location;
      }
      if (additionalData?.reportedFoundAt) {
        updateData.reported_found_at = additionalData.reportedFoundAt;
      }
      if (additionalData?.droppedOffAt) {
        updateData.dropped_off_at = additionalData.droppedOffAt;
      }
      if (additionalData?.pickedUpAt) {
        updateData.picked_up_at = additionalData.pickedUpAt;
      }
      if (additionalData?.expiresAt) {
        updateData.expires_at = additionalData.expiresAt;
      }

      const { data, error } = await supabase
        .from("items")
        .update(updateData)
        .eq("qr_code", qrCode)
        .select()
        .single();

      if (error) {
        console.error("Error updating item:", error);
        return null;
      }

      return this.mapDbToItem(data);
    } catch (error) {
      console.error("Exception updating item:", error);
      return null;
    }
  },

  // Reset item to active (false alarm)
  async resetItemToActive(qrCode: string): Promise<ItemData | null> {
    try {
      const { data, error } = await supabase
        .from("items")
        .update({
          status: "active",
          location: null,
          reported_found_at: null,
          dropped_off_at: null,
          picked_up_at: null,
          expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("qr_code", qrCode)
        .select()
        .single();

      if (error) {
        console.error("Error resetting item:", error);
        return null;
      }

      return this.mapDbToItem(data);
    } catch (error) {
      console.error("Exception resetting item:", error);
      return null;
    }
  },

  // Delete/unlink an item (user can only delete their own items)
  async deleteItem(qrCode: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("User must be authenticated to delete items");
        return false;
      }

      const { error } = await supabase
        .from("items")
        .delete()
        .eq("qr_code", qrCode)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting item:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Exception deleting item:", error);
      return false;
    }
  },

  // Helper: Map database row to ItemData
  mapDbToItem(dbItem: any): ItemData {
    return {
      id: dbItem.qr_code, // Use qr_code as the ID for compatibility
      qr_code: dbItem.qr_code,
      name: dbItem.name,
      ownerName: dbItem.owner_name || "",
      ownerEmail: dbItem.owner_email || "", // Will be empty for non-owner views
      status: dbItem.status,
      location: dbItem.location || undefined,
      reportedFoundAt: dbItem.reported_found_at || undefined,
      droppedOffAt: dbItem.dropped_off_at || undefined,
      pickedUpAt: dbItem.picked_up_at || undefined,
      expiresAt: dbItem.expires_at || undefined,
      registeredAt: dbItem.registered_at || dbItem.created_at,
    };
  },

  // Check if Supabase is configured
  isConfigured(): boolean {
    return !!(supabaseUrl && supabaseAnonKey);
  },
};

// Authentication service
export const auth = {
  // Sign up a new user
  async signUp(
    email: string,
    password: string,
    name?: string
  ): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || "",
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error("Exception during sign up:", error);
      return { user: null, error: "An unexpected error occurred" };
    }
  },

  // Sign in user
  async signIn(
    email: string,
    password: string
  ): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error("Exception during sign in:", error);
      return { user: null, error: "An unexpected error occurred" };
    }
  },

  // Sign out user
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error("Exception during sign out:", error);
      return { error: "An unexpected error occurred" };
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error("Exception getting current user:", error);
      return null;
    }
  },

  // Get current session
  async getCurrentSession(): Promise<Session | null> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error("Exception getting current session:", error);
      return null;
    }
  },

  // Listen to auth state changes
  onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getCurrentSession();
    return !!session;
  },
};

// Export types
export type { ItemData, Location };
