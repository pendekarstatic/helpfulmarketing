-- Fix: Prevent users from creating templates with is_builtin = true
DROP POLICY IF EXISTS "Users can create templates" ON public.templates;

CREATE POLICY "Users can create templates" 
ON public.templates 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  is_builtin = false
);