import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase - Usando variables de entorno
interface SupabaseConfig {
    supabaseUrl: string;
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Variables de entorno de Supabase no configuradas. ' +
    'Copia .env.example a .env y configura EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY'
  );
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;
