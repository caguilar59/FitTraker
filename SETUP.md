# FitTraker setup

1. Install Node.js compatible with the package engines in package-lock.json, then run `npm ci` in this project.
2. Copy `.env.example` to `.env`. Fill in `MONGO_URI` with your own database user credentials and the shared cluster hostname. Keep the database path exactly `FitTracker`; `fittrack` is a different database. URL-encode username/password characters. Never share or commit the completed file.
3. Generate a private session secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and put it in `SESSION_SECRET`. Keep it stable across restarts. Servers serving one shared deployment must use the same secret.
4. Fill in `RAPIDAPI_KEY` for exercise search. Atlas access also requires your current public IP to be allowed and a database user with suitable access. Atlas website membership and database credentials are separate.
5. Run `npm start` (or `npm run dev`) from the project directory. Open `http://localhost:3000`. Opening HTML directly or using Live Server on port 5500 bypasses the backend and breaks login/API requests.
6. Use your FitTraker account login. Programs, accounts, sessions, and support messages use Atlas. Programs are private to their account: signing in with the same account on another computer loads the same saved programs. Different accounts do not share programs.

## Existing browser programs

Old programs under the browser's `programs` localStorage key are preserved but not imported automatically because that key has no account owner. Recreate the programs you want in the signed-in account. Saving/deleting cloud programs does not alter that legacy storage.

## Verify another developer's connection

After their server starts successfully, sign in and check the Program page. To test syncing, create a clearly labelled disposable program only with the account owner's agreement, then check the same account in a second browser and remove the test through the app. Do not publish credentials, user documents, or session data for troubleshooting.

`npm test` runs isolated tests; it does not require Atlas credentials. Restart the server after backend changes. No Atlas permissions or network rules are changed by this update. The Programs collection is created when the app uses the new model.
