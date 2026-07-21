
import { createClient } from '@supabase/supabase-js'

// Configuração via variáveis de ambiente (Melhor Prática)
// As variáveis devem ser VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://seu-projeto.supabase.cohttps://supabase.com/dashboard/project/mazmhvzbjcgmdqtkocpz';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hem1odnpiamNnbWRxdGtvY3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDExODgsImV4cCI6MjA4NTMxNzE4OH0.FIdLEqNCrh7l69YpuRKgy9vie7llud2uvrBUQAQhc3w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Função de diagnóstico para verificar a conexão com o Supabase.
 * É chamada automaticamente no App.tsx.
 */
export async function checkSupabaseConnection() {
    console.log("SUPABASE: Verificando conexão...");

    try {
        if (!import.meta.env.VITE_SUPABASE_URL || supabaseUrl.includes('seu-projeto')) {
            console.warn("⚠️ SUPABASE: Variáveis de ambiente não configuradas ou URL padrão detectada.");
            console.warn("   -> Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env");
            return false;
        }

        // Tenta uma query leve (HEAD) para verificar acesso
        const { count, error } = await supabase.from('reports').select('*', { count: 'exact', head: true });

        if (error) {
            console.error("❌ SUPABASE: Erro ao conectar:", error.message);
            return false;
        }

        console.log(`✅ SUPABASE: Conectado! (Acesso a tabela 'reports' OK)`);
        return true;
    } catch (e) {
        console.error("❌ SUPABASE: Falha na conexão (Exceção).", e);
        return false;
    }
}
