-- Active RLS sur la table purchases (au cas où ce n'est pas déjà fait)
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- 1. Autoriser les utilisateurs à voir leurs propres achats
CREATE POLICY "Users can view their own purchases"
ON public.purchases
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Autoriser les utilisateurs à insérer leurs propres achats
CREATE POLICY "Users can insert their own purchases"
ON public.purchases
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Autoriser les utilisateurs à mettre à jour leurs propres achats (si nécessaire)
CREATE POLICY "Users can update their own purchases"
ON public.purchases
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
