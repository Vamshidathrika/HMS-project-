import { supabase } from './supabaseClient';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  roleName: string;
  clinicId: string;
  clinicName: string;
}

export const supabaseAuth = {
  /**
   * Login with email and password
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  /**
   * Sign out current session
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get active session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Fetch details of currently logged-in user profile, including role and clinic
   */
  async getCurrentProfile(): Promise<UserProfile | null> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return null;

    // Fetch user profile from public.users table joined with roles and clinics
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        clinic_id,
        roles ( name ),
        clinics ( name )
      `)
      .eq('id', user.id)
      .single();

    if (error || !data) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    const rawData = data as any;
    return {
      id: rawData.id,
      email: rawData.email,
      fullName: rawData.full_name,
      roleName: rawData.roles?.name || 'General',
      clinicId: rawData.clinic_id,
      clinicName: rawData.clinics?.name || 'Unassigned'
    };
  }
};
