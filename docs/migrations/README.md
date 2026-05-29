# docs/migrations — espelho documentado do banco (easy-idiomas)

> Backup **legível e versionado** do estado do banco. Padrão DIGIAI (CLAUDE.md §3, desde 2026-05-29).
> Banco isolado deste app — não confundir com o banco Clearix (compartilhado pelos sub-apps clearix_*).

## Conteúdo

| Arquivo | O que é | Fonte de verdade? |
|---|---|---|
| `migrations/` | Cópia fiel das 18 migrations canônicas (`supabase/migrations`) | ✅ **sim** — DDL exato, ordem real |
| `schema.sql` | ⏳ pendente — sem token Management no `.env` | — |

## Regenerar

```bash
node Cockpit/scripts/dump-db-mirror.mjs easy-idiomas
```

Lê token Supabase + URL do `easy-idiomas/.env` (nunca expõe). Read-only no banco.

## Ressalvas

- `schema.sql` é estrutural. Constraints/índices/triggers exatos: ver `migrations/`.
- `seed.sql` **não é gerado automaticamente** — curadoria humana por LGPD (R-013).
