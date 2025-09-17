/**
 * Supabase Integration Layer (Optional)
 * Enables using Supabase for auth and data instead of local/localhost APIs.
 * Requires window.ENV.SUPABASE_URL and window.ENV.SUPABASE_ANON_KEY.
 */

(function () {
  'use strict';

  const cfg = (window.ENV || {});
  const hasSupabaseConfig = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  const hasSdk = typeof window.supabase !== 'undefined' || typeof window.createClient !== 'undefined';

  if (!hasSupabaseConfig) {
    console.log('Supabase config not found; skipping Supabase integration');
    window.Supabase = { enabled: false };
    return;
  }

  if (!hasSdk && typeof window.Supabase !== 'undefined' && window.Supabase.enabled) {
    // Already initialized elsewhere
    return;
  }

  // createClient is exposed by the CDN script of @supabase/supabase-js v2
  const createClient = window.createClient || (window.supabase && window.supabase.createClient);
  if (!createClient) {
    console.error('Supabase SDK not loaded. Include @supabase/supabase-js before this script.');
    window.Supabase = { enabled: false };
    return;
  }

  const client = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

  // ---- Auth API (email/password baseline) ----
  class SupabaseAuthApi {
    constructor(client) { this.client = client; }

    async login({ identifier, password, role }) {
      // identifier may be email or phone. We default to email/password.
      const email = identifier;
      const { data, error } = await this.client.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      return {
        user: data.user,
        accessToken: data.session?.access_token,
        refreshToken: data.session?.refresh_token
      };
    }

    async register(userData) {
      const { email, password, role = 'customer', name, phone } = userData;
      const { data, error } = await this.client.auth.signUp({ email, password, options: { data: { role, name, phone } } });
      if (error) throw new Error(error.message);

      // Also insert into public users profile table (optional; create table in SQL)
      try {
        await this.client.from('users').insert({
          auth_id: data.user?.id || null,
          email,
          phone,
          name,
          role,
          status: 'active',
          verified: false
        });
      } catch (_) {}

      return {
        user: data.user,
        accessToken: data.session?.access_token,
        refreshToken: data.session?.refresh_token
      };
    }

    async logout() {
      const { error } = await this.client.auth.signOut();
      if (error) throw new Error(error.message);
      return { success: true };
    }
  }

  // ---- Bookings API ----
  class SupabaseBookingApi {
    constructor(client) { this.client = client; }

    async createBooking(booking) {
      const { data, error } = await this.client.from('bookings').insert(booking).select('*').single();
      if (error) throw new Error(error.message);
      return data;
    }

    async getBookings(params = {}) {
      let query = this.client.from('bookings').select('*').order('created_at', { ascending: false });
      if (params.customerId) query = query.eq('customer_id', params.customerId);
      if (params.providerId) query = query.eq('provider_id', params.providerId);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    }

    async getBookingDetails(id) {
      const { data, error } = await this.client.from('bookings').select('*').eq('id', id).single();
      if (error) throw new Error(error.message);
      return data;
    }

    async updateBooking(id, updates) {
      const { data, error } = await this.client.from('bookings').update(updates).eq('id', id).select('*').single();
      if (error) throw new Error(error.message);
      return data;
    }

    async cancelBooking(id) {
      const { data, error } = await this.client.from('bookings').update({ status: 'cancelled' }).eq('id', id).select('*').single();
      if (error) throw new Error(error.message);
      return data;
    }
  }

  // ---- Services API (catalog) ----
  class SupabaseServicesApi {
    constructor(client) { this.client = client; }

    async listServices() {
      const { data, error } = await this.client.from('services').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    }

    async getService(id) {
      const { data, error } = await this.client.from('services').select('*').eq('id', id).single();
      if (error) throw new Error(error.message);
      return data;
    }

    async createService(service) {
      const { data, error } = await this.client.from('services').insert(service).select('*').single();
      if (error) throw new Error(error.message);
      return data;
    }
  }

  // Expose globally and override default APIs if present
  const supabaseApis = {
    client,
    auth: new SupabaseAuthApi(client),
    bookings: new SupabaseBookingApi(client),
    services: new SupabaseServicesApi(client)
  };

  // Override global API facades if available
  window.Supabase = { enabled: true, ...supabaseApis };

  // Prefer Supabase-backed APIs
  window.AuthApi = supabaseApis.auth;
  window.BookingApi = supabaseApis.bookings;
  // Payments left to gateway; keep existing PaymentApi or implement table if needed

  console.log('Supabase integration enabled');
})();

