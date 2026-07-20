-- nexMonie PostgreSQL Schema - Core & Opportunities

-- 1. Profiles Table (Restored stable version)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  tier TEXT DEFAULT 'nex Basic',
  is_verified BOOLEAN DEFAULT false,
  preferred_language TEXT DEFAULT 'English',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Wallets Table
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  available NUMERIC DEFAULT 0.00,
  savings NUMERIC DEFAULT 0.00,
  investments NUMERIC DEFAULT 0.00,
  vault NUMERIC DEFAULT 0.00,
  lastUpdated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  walletId UUID REFERENCES public.wallets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense', 'transfer')),
  category TEXT,
  status TEXT DEFAULT 'pending',
  referenceId TEXT UNIQUE,
  recipient TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Opportunities Table (NEW for Earn screen)
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  organization_logo TEXT,
  is_verified BOOLEAN DEFAULT false,
  description TEXT,
  short_description TEXT,
  reward_amount NUMERIC,
  reward_currency TEXT DEFAULT 'NGN',
  category TEXT,
  difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Expert')),
  deadline DATE,
  estimated_time TEXT,
  location TEXT,
  is_remote BOOLEAN DEFAULT true,
  ecosystem TEXT,
  tags TEXT[],
  requirements TEXT[],
  benefits TEXT[],
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunityId UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'submitted',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for all
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
