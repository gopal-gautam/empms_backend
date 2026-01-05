# EMPMS Backend Project setup Setup

This backend uses Auth0 for authentication and authorization. Only users with the `admin` role can access employee routes.

## Setup Instructions

### 1. Configure Auth0

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new API (or use an existing one):
   - Go to Applications > APIs
   - Click "Create API"
   - Set a name (e.g., "Employee Management API")
   - Set an identifier (e.g., `https://api.empms.com`)
   - Keep the signing algorithm as RS256

3. Configure your Auth0 Application:
   - Go to Applications > Applications
   - Select your application
   - Add your frontend URL to "Allowed Callback URLs" and "Allowed Web Origins"
   - Note your Domain and Client ID (needed for frontend)

4. Set up roles:
   - Go to User Management > Roles
   - Create an "admin" role
   - Assign this role to users who should access employee routes

5. Create an Auth0 Action to add roles to the token:
   - Go to Actions > Flows > Login
   - Click the "+" button and create a new action
   - Use the following code:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://your-app';
  if (event.authorization) {
    api.idToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
    api.accessToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
  }
};
```

   - Add the action to your Login flow

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
AUTH0_ISSUER_URL=https://your-tenant.auth0.com/
AUTH0_AUDIENCE=your-api-identifier
PORT=3000
```

**Important:** Make sure the `AUTH0_ISSUER_URL` ends with a trailing slash `/`

### 3. Update JWT Strategy (if needed)

If you used a different namespace in your Auth0 Action, update the namespace in `src/auth/jwt.strategy.ts`:

```typescript
const roles = payload['https://your-app/roles'] || payload.permissions || [];
```

Change `'https://your-app/roles'` to match your namespace.

## Frontend Integration

Your frontend should:

1. Use the Auth0 SDK to authenticate users
2. Include the access token in the Authorization header for all API requests:

```javascript
Authorization: Bearer <access_token>
```

3. Ensure users have the `admin` role assigned in Auth0

## Protected Routes

All employee routes are now protected and require:
- Valid Auth0 JWT token
- User must have the `admin` role

Protected endpoints:
- `POST /employees` - Create employee
- `GET /employees` - Get all employees
- `GET /employees/:id` - Get employee by ID
- `DELETE /employees/:id` - Delete employee

## Testing

To test authentication:

1. Get an access token from Auth0 (via frontend or using Auth0 test tools)
2. Make requests with the token:

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" http://localhost:3000/employees
```

## Troubleshooting

- **401 Unauthorized**: Token is missing or invalid
- **403 Forbidden**: User doesn't have the required `admin` role
- Check that environment variables are set correctly
- Verify the token includes roles in the custom claim
- Ensure the Auth0 Action is added to the Login flow
