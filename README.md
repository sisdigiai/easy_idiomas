# Easy Idiomas

SaaS para escolas de idiomas — ecossistema sisdigiai.

**Deploy em produção:** (a definir)

## Stack

React 19 + Vite + Supabase + Google Gemini API

## Rodar localmente

```bash
npm install
npm run dev
```

## Variáveis de ambiente

Copie `.env.example` para `.env` e configure:

- `GEMINI_API_KEY` — Google Gemini API
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — Supabase
- `GITHUB_USERNAME` / `GITHUB_TOKEN` — credenciais para `git push` (ver abaixo)

## Configurar `git push` com token do .env (uma vez por clone)

Este repo segue a convenção do ecossistema sisdigiai: credential helper que lê `GITHUB_TOKEN` do `.env`. Configurar:

```bash
git config --local --unset-all credential.helper
git config --local --add credential.helper ""
git config --local --add credential.helper "$(pwd)/scripts/git-credential-env.sh"
```

PAT precisa de escopo `repo`. Rotaciona em https://github.com/settings/tokens.

## Convenções do ecossistema

Este repo segue as convenções técnicas documentadas em:

`D:\projetos\diferentes\docs\digiai\docs\07-operacao\convencoes-tecnicas-ecossistema-sisdigiai.md`

Resumindo as travas principais:

- **Branch único `main`** — sem branches paralelas
- **Credential helper via `.env`** — sem popup do Git Credential Manager
- **Backups antes de operações destrutivas** — em `D:\projetos\diferentes\_backups\`
- **README completo** com propósito, deploy URL, stack, instruções
