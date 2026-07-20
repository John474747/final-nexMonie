
import { useUser, useDoc } from '@/firebase';
import { translations, type Language } from '@/lib/translations';

export function useTranslation() {
  const { user } = useUser();

  // Optimized for Supabase PostgreSQL profiles
  const { data: profile } = useDoc(user ? { table: 'profiles', id: user.uid } : null);

  const currentLanguage: Language = (profile?.preferred_language as Language) || 'English';

  const t = (key: string) => {
    return translations[currentLanguage]?.[key] || translations['English'][key] || key;
  };

  return { t, currentLanguage };
}
