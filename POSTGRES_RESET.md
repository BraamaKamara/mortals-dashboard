# Quick PostgreSQL Password Reset

## After editing pg_hba.conf to use "trust", run:

```powershell
$env:Path += ";C:\Program Files\PostgreSQL\17\bin"
psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'your_new_password_here';"
```

## Then change pg_hba.conf back to "scram-sha-256" and restart the service.

---

**OR use this simpler alternative:**

Since this is for local development, you can set a simple password like: `postgres123`

Once you have access, we'll create the database with:
```powershell
psql -U postgres -c "CREATE DATABASE mortals_dashboard;"
```
