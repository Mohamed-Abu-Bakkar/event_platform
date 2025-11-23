SECRETS — secure handling of environment variables and credentials

This project uses environment variables for secrets (for example, `MONGODB_URI`, `CLERK_SECRET_KEY`, etc.). Keep secrets out of source control and follow best practices below.

1) Ensure local env files are ignored
- The repository should ignore `*.env` files. This project already includes the pattern `.env*.local` in `.gitignore`, which covers `/.env.local`.

2) Use a `.env.example` to document required keys (but don't include values)
- Create a `.env.example` that lists the variable names and example placeholders. Example:

  MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/evently?retryWrites=true&w=majority"
  CLERK_SECRET_KEY=sk_test_xxx
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx

- Commit only `.env.example` so other devs know which variables are required.

3) Local development
- Use a local `.env.local` with the real values (this file must be ignored by git).
- Restart the dev server after changing `.env.local` (e.g. `pnpm dev`).

4) Production & deployments
- Use your host's secret manager / env settings instead of committing env files.
  - Vercel: Project Settings → Environment Variables. Add `MONGODB_URI` and other vars.
  - Netlify / Render / Fly / Heroku: they all provide secure env variable support.
- Never expose server-only secrets as `NEXT_PUBLIC_*`. Only browser-safe values should use `NEXT_PUBLIC_` prefix.

5) CI/CD (GitHub Actions example)
- Add secrets in the repository Settings → Secrets → Actions (e.g. `MONGODB_URI`).
- Use them in workflows:

  env:
    MONGODB_URI: ${{ secrets.MONGODB_URI }}

6) Cloud secret managers (recommended for production)
- Consider a managed secrets system for better audit, rotation and access control:
  - AWS Secrets Manager / Parameter Store
  - Google Secret Manager
  - Azure Key Vault
  - HashiCorp Vault

7) MongoDB Atlas tips
- When using Atlas, configure an access list (IP whitelist). For development you can temporarily allow your IP or `0.0.0.0/0` (not recommended for long-term).
- Use a database user with limited privileges for the app.

8) Clerk (authentication provider) notes
- Clerk recently deprecated `CLERK_API_KEY` and `apiKey`. Use `CLERK_SECRET_KEY` (server) and `secretKey` per Clerk docs. Keep publishable keys in `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` only.

9) Rotation, least privilege and audits
- Rotate credentials regularly.
- Limit permissions of the service account (database user) to only what's needed.
- Audit access in the platform you're using.

10) Troubleshooting
- If Next.js doesn't pick up env changes, restart the dev server.
- Ensure no stray `.env` files are committed. To check what Git is tracking:

  git ls-files --exclude-standard --others

If you'd like, I can:
- Create a `.env.example` for this repository.
- Add a CI workflow snippet to `.github/workflows` that demonstrates using `MONGODB_URI` from GitHub Secrets.
- Add a short script that validates required env vars at startup and prints friendly errors.

