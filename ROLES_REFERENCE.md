# UUIDs de Referencia para el Sistema de Roles

## Roles del Sistema

### 🔴 Superadministrador (Número: 1)
```
UUID: 11111111-1111-1111-1111-111111111111
```

### 🟡 Administrador (Número: 2)
```
UUID: 22222222-2222-2222-2222-222222222222
```

### 🟢 Cliente (Número: 3)
```
UUID: 33333333-3333-3333-3333-333333333333
```

## Usuarios Superadministradores Existentes

### Usuario 1:
```
UUID: 02ea450b-b18b-46cc-9743-82bae44e9740
Rol: Superadministrador (11111111-1111-1111-1111-111111111111)
```

### Usuario 2:
```
UUID: 2d9cfd1c-e9a5-45cb-b4a7-f3399c67a668
Rol: Superadministrador (11111111-1111-1111-1111-111111111111)
```

## Uso en APIs

### Para crear administrador:
```typescript
role_id: '22222222-2222-2222-2222-222222222222'
```

### Para crear cliente:
```typescript
role_id: '33333333-3333-3333-3333-333333333333'
```

### Para verificar superadministrador:
```sql
WHERE r.id = '11111111-1111-1111-1111-111111111111'
-- O usando numero:
WHERE r.numero = 1
```

## Consultas Útiles

### Obtener rol de un usuario:
```sql
SELECT r.nombre, r.numero 
FROM user_has_roles uhr
JOIN roles r ON r.id = uhr.role_id
WHERE uhr.user_id = 'UUID_DEL_USUARIO';
```

### Verificar si es superadministrador:
```sql
SELECT EXISTS (
  SELECT 1 FROM user_has_roles uhr
  JOIN roles r ON r.id = uhr.role_id
  WHERE uhr.user_id = 'UUID_DEL_USUARIO' AND r.numero = 1
);
```