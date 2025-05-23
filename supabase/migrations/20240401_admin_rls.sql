-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Acceso completo para administradores en complementos" ON complementos;
DROP POLICY IF EXISTS "Acceso completo para administradores en cantidadcomplemento" ON cantidadcomplemento;
DROP POLICY IF EXISTS "Acceso completo para administradores en menus" ON menus;
DROP POLICY IF EXISTS "Acceso completo para administradores en menucomplementos" ON menucomplementos;
DROP POLICY IF EXISTS "Acceso completo para administradores en entregamenus" ON entregamenus;
DROP POLICY IF EXISTS "Acceso completo para administradores en usuarios" ON usuarios;
DROP POLICY IF EXISTS "Acceso completo para administradores en roles" ON roles;
DROP POLICY IF EXISTS "Lectura para usuarios autenticados en complementos" ON complementos;
DROP POLICY IF EXISTS "Lectura para usuarios autenticados en cantidadcomplemento" ON cantidadcomplemento;
DROP POLICY IF EXISTS "Lectura para usuarios autenticados en menus" ON menus;
DROP POLICY IF EXISTS "Lectura para usuarios autenticados en menucomplementos" ON menucomplementos;
DROP POLICY IF EXISTS "Lectura para usuarios autenticados en entregamenus" ON entregamenus;

-- Deshabilitar RLS temporalmente
ALTER TABLE complementos DISABLE ROW LEVEL SECURITY;
ALTER TABLE cantidadcomplemento DISABLE ROW LEVEL SECURITY;
ALTER TABLE menus DISABLE ROW LEVEL SECURITY;
ALTER TABLE menucomplementos DISABLE ROW LEVEL SECURITY;
ALTER TABLE entregamenus DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;

-- Dar permisos directos a roles específicos
GRANT ALL ON complementos TO authenticated;
GRANT ALL ON cantidadcomplemento TO authenticated;
GRANT ALL ON menus TO authenticated;
GRANT ALL ON menucomplementos TO authenticated;
GRANT ALL ON entregamenus TO authenticated;
GRANT ALL ON usuarios TO authenticated;
GRANT ALL ON roles TO authenticated;
GRANT ALL ON auth.users TO authenticated;

-- Dar permisos de secuencia
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Crear función para verificar rol de usuario
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role::text
  FROM auth.users
  WHERE id = auth.uid();
$$;

-- Dar permiso para ejecutar la función
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated; 