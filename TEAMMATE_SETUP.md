# Connect FitTraker to the shared Atlas database

1. Pull the latest project code and run `npm install`.
2. Ask the project owner to create your own Atlas database user with the `readWrite` role on `FitTracker`, restricted to Cluster0.
3. Have the owner add your current public IP address to the Atlas IP Access List.
4. Copy `.env.example` to `.env`. Enter your own database username and password privately. Keep the database name `FitTracker` exactly as written. URL-encode special characters in credentials.
5. Run `node server.js` and check for `MongoDB connected`.
6. Open the existing login page and sign in with a FitTraker account. App account passwords are different from Atlas database passwords.

The app uses the `Users` and `Support Messages` collections in `FitTracker`.
Never commit `.env` or share another person's Atlas credentials. Both backends use the same Atlas data; each computer keeps its own private configuration.
