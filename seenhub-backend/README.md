# SeenHub Rails API - Production Ready 🚀

This is the newly migrated Ruby on Rails API for SeenHub. It replaces the legacy JSON-based Next.js API.

## 🚀 Deployment Checklist

### 1. Database
The app is currently using SQLite. For production (Heroku, AWS, Railway), you should switch to PostgreSQL:
- Update `Gemfile`: Move `sqlite3` to development and add `gem 'pg'`.
- Update `config/database.yml` to use the `postgresql` adapter.

### 2. Environment Variables
Ensure these variables are set on your production server:
- `RAILS_ENV=production`
- `SECRET_KEY_BASE`: Generate using `rails secret`.
- `PORT`: Set to `3001` (or update Next.js proxy if different).

### 3. Cross-Origin Resource Sharing (CORS)
Update `config/initializers/cors.rb`:
```ruby
allow do
  origins 'https://your-frontend-domain.com' # Change * to your actual domain
  resource '*', headers: :any, methods: [:get, :post, :put, :patch, :delete, :options, :head]
end
```

### 4. Admin Credentials
The default admin is:
- **Email**: admin@seenhub.ae
- **Password**: admin123
- **Action**: Change the password immediately upon first login in production.

## 🛠️ Maintenance
- **Logs**: Check `log/production.log` for any errors.
- **Seeds**: Use `rails db:seed` only for initial setup or data recovery.

---
Built with ❤️ by Antigravity
