// Supabase client configuration and database service

import { createClient } from "@supabase/supabase-js";
import type { ItemData, Location } from "./config";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase environment variables not set. Database features will not work.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database service functions
export const db = {
  // Register a new item
  async registerItem(itemData: Omit<ItemData, "id">): Promise<ItemData | null> {
    try {
      const { data, error } = await supabase
        .from("items")
        .insert([
          {
            qr_code: itemData.qrCode,
            name: itemData.name,
            owner_name: itemData.ownerName || null,
            owner_email: itemData.ownerEmail,
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

  // Get all items for a user by email
  async getItemsByEmail(email: string): Promise<ItemData[]> {
    try {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("owner_email", email)
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
    },
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

  // Delete/unlink an item
  async deleteItem(qrCode: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("items")
        .delete()
        .eq("qr_code", qrCode);

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
      qrCode: dbItem.qr_code,
      name: dbItem.name,
      ownerName: dbItem.owner_name || "",
      ownerEmail: dbItem.owner_email,
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

// Export types
export type { ItemData, Location };
