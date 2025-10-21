# Remote configuration and authentication guide

## Remote status
- The `origin` remote currently points to `https://github.com/Nokitomo/Turni-dipendenti.git`.
- The local `dev` branch tracks the remote branch but pushes fail because the environment does not have GitHub credentials.

## Provide credentials for HTTPS pushes
1. On GitHub, create a Personal Access Token (PAT) with at least the `repo` scope. The fine-grained tokens introduced by GitHub also work as long as they allow pushing to `Nokitomo/Turni-dipendenti`.
2. In this environment, export the token so that Git can read it when pushing:
   ```bash
   export GITHUB_TOKEN="<il-tuo-token>"
   ```
3. Run the push using the token for authentication:
   ```bash
   git push https://$GITHUB_TOKEN@github.com/Nokitomo/Turni-dipendenti.git dev
   ```
   - Git strips the token from the command history, but avoid sharing terminal logs that contain it.
   - After the push, you can unset the variable with `unset GITHUB_TOKEN`.

## Alternative: SSH authentication
If you prefer SSH instead of HTTPS:
1. Generate an SSH key pair (if you do not already have one) with `ssh-keygen -t ed25519`.
2. Add the public key (`~/.ssh/id_ed25519.pub`) to your GitHub account.
3. Configure the remote with the SSH URL and push:
   ```bash
   git remote set-url origin git@github.com:Nokitomo/Turni-dipendenti.git
   GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519" git push origin dev
   ```
   Replace the identity path with the correct private key file if needed.

Once either authentication method is configured, I will be able to push commits from this environment to your GitHub repository.
