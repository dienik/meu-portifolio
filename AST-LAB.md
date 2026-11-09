# AST lab (branch `lab/ast-vulns`, never merge or deploy)

Vulnerabilities planted on purpose to learn Conviso AST. Every credential is fake.

| Scanner | File | What is planted |
|---|---|---|
| SAST | `src/components/lab/CommentPreview.vue` | XSS via `v-html` and `innerHTML` from the URL |
| SAST | `src/lib/lab/unsafe.ts` | `eval`, `new Function` and open redirect from query params |
| SAST | `server/index.js` | SQL injection, command injection, path traversal, reflected XSS, JWT accepting `none` |
| SCA | `server/package.json` + `server/package-lock.json` | express 4.16.0, lodash 4.17.4, axios 0.21.0, minimist 1.2.0, marked 0.3.6, jsonwebtoken 8.5.1, node-fetch 2.6.0 |
| Secret | `src/lib/lab/unsafe.ts`, `server/index.js`, `server/Dockerfile`, `infra/` | GitHub token, Stripe key, database password |
| IaC | `infra/main.tf` | Public read/write S3 bucket, SSH and MySQL open to the internet, public unencrypted RDS |
| IaC | `infra/k8s/deployment.yaml` | Privileged pod, `hostNetwork`/`hostPID`, root user, `latest` tag |
| IaC | `server/Dockerfile` | Runs as root, secret in `ENV` |
| Container | `node:14` (base image of `server/Dockerfile`) | End-of-life image; scan with `conviso container run node:14` |

DAST is not covered: it needs the application running at a URL.
