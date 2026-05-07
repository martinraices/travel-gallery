# Firebase deploy from GitHub Actions

This repo deploys Firebase Hosting, Firestore rules/indexes, and Cloud Functions from `.github/workflows/main.yml`.

## GitHub repository secrets

Add these in GitHub:

- `FIREBASE_SERVICE_ACCOUNT`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

`FIREBASE_SERVICE_ACCOUNT` must be the full JSON key for a Google Cloud service account in project `wanderlust-gallery`.

## Suggested Google Cloud roles

The service account needs enough access to deploy Hosting, Firestore rules, Cloud Functions, and Secret Manager secrets.

Suggested roles:

- Firebase Admin
- Cloud Functions Admin
- Cloud Run Admin
- Cloud Build Editor
- Service Account User
- Artifact Registry Administrator
- Secret Manager Admin

## Manual run

The workflow runs on pushes to `main`, and can also be run from the GitHub Actions tab with `workflow_dispatch`.

The deploy command uses `--force` so Firebase can configure an Artifact Registry cleanup policy for function images without an interactive prompt.

## Notes

- Do not commit AWS keys to the repo.
- Firestore rules in `firestore.rules` are deployed by this workflow.
- Function secrets are updated from GitHub Secrets before each deploy.
