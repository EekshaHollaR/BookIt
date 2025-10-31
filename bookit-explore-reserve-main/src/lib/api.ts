import { supabase } from "@/integrations/supabase/client";
import { Experience, BookingDetails } from "@/types/experience";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const api = {
  // Fetch all experiences
  async getExperiences(): Promise<Experience[]> {
    const { data, error } = await supabase.functions.invoke('experiences', {
      method: 'GET',
    });

    if (error) {
      console.error('Error fetching experiences:', error);
      throw new Error('Failed to fetch experiences');
    }

    return data;
  },

  // Fetch single experience with slot details
  async getExperience(id: string): Promise<Experience> {
    const { data, error } = await supabase.functions.invoke(`experiences/${id}`, {
      method: 'GET',
    });

    if (error) {
      console.error('Error fetching experience:', error);
      throw new Error('Experience not found');
    }

    return data;
  },

  // Create a booking
  async createBooking(bookingData: BookingDetails & { fullName: string; email: string; discount: number }): Promise<{ bookingRef: string }> {
    const { data, error } = await supabase.functions.invoke('bookings', {
      method: 'POST',
      body: bookingData,
    });

    if (error) {
      console.error('Error creating booking:', error);
      throw new Error(error.message || 'Failed to create booking');
    }

    return data;
  },

  // Validate promo code
  async validatePromo(code: string): Promise<{ valid: boolean; discount?: number; error?: string }> {
    const { data, error } = await supabase.functions.invoke('promo-validate', {
      method: 'POST',
      body: { code },
    });

    if (error) {
      console.error('Error validating promo:', error);
      return { valid: false, error: 'Failed to validate promo code' };
    }

    return data;
  },
};
