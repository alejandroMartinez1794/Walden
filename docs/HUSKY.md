# Husky hooks: uso y notas rápidas

Qué hace este set de hooks
- Bloquea commits que intenten añadir `node_modules` o archivos `.env*`.
- En commits con cambios en `backend/` ejecuta tests rápidos relacionados (`--findRelatedTests`).
- Valida formato de mensaje con una convención simple (`type(scope): subject`).

Comandos útiles
- Instalar hooks (si no se ejecutó automáticamente):

```bash
npm run prepare
```

- Saltar los tests rápidos en pre-commit:

```bash
SKIP_PRECOMMIT_TESTS=true git commit -m "chore: ..."
```

- Desactivar temporalmente todos los hooks (solo para CI especiales o debugging):

```bash
npx husky disable
# y luego reactivar
npx husky enable
```

Si necesitas que el pre-commit corra una suite distinta (p.ej. solo lint), dime y lo ajusto.
