# Remote configuration and authentication guide

## Remote status
- The `origin` remote now embeds the provided Personal Access Token (PAT):
  ```bash
  git remote get-url origin
  # https://<token>@github.com/Nokitomo/Turni-dipendenti.git
  ```
- Because the PAT is stored in the remote URL, **do not share** the output of `git remote -v` publicly. Consider rotating the token after validating that the push works.

## Provide credentials for HTTPS pushes
1. Export the PAT so you can reuse it without retyping:
   ```bash
   export GITHUB_PAT="<il-tuo-token>"
   git remote set-url origin "https://$GITHUB_PAT@github.com/Nokitomo/Turni-dipendenti.git"
   ```
2. Push the desired branch (for example `dev` or the current `work` branch):
   ```bash
   git push -u origin dev
   ```
3. Once the push succeeds, remove the token from the environment if you no longer need it:
   ```bash
   unset GITHUB_PAT
   ```

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

## Why pushes cannot be performed automatically from this workspace

The execution environment used for these tasks does **not** retain or reuse
secrets that you share (PAT, SSH key, …). As soon as the conversation ends the
token is scrubbed, so the workspace cannot authenticate with GitHub on its own.
Because of that limitation I can prepare commits locally, but the actual
`git push` must be run from a shell session where you inject the credentials at
runtime.

## Publish the branch and open a pull request yourself

After running the push command manually you can open a pull request in one of
these ways:

1. **GitHub Web UI** – visit
   `https://github.com/Nokitomo/Turni-dipendenti/compare` and select `work` as
   the source branch.
2. **GitHub CLI** – with `gh` installed and authenticated, run
   `gh pr create --base main --head work --fill`.

Either route will expose all the commits prepared in this workspace so you can
review them and merge.
