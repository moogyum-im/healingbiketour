UPDATE public.profiles
SET role = 'admin'
WHERE email = 'healingbiketour@gmail.com';

SELECT id, email, role FROM public.profiles WHERE email = 'healingbiketour@gmail.com';

