# Never

- Only .env.example may be read, opened, or edited. It is the checked-in template and contains no real secrets.
- Never read, open, print, quote, or otherwise access the contents of .env.dev, .env.stage, .env.prod, or .env.test. They may contain real credentials/secrets. If a task seems to require their contents, stop and ask the user instead of opening them.
