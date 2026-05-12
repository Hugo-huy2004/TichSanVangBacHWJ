# Zalo Mini App setup

## Credentials

Put secrets only in backend runtime environment:

```env
ZALO_MINI_APP_ID=your-mini-app-id
ZALO_MINI_APP_SECRET=your-mini-app-secret
REQUIRE_ZALO_ACCESS_TOKEN=true
```

The frontend may contain only public values:

```env
VITE_ZALO_MINI_APP_ID=your-mini-app-id
VITE_API_BASE_URL=https://your-api-domain.example
```

Do not put `ZALO_MINI_APP_SECRET` in `frontend/.env`, React code, `app-config.json`, or `zmp-cli.json`.

## Local development

1. Fill `backend/.env`.
2. Fill `frontend/.env`.
3. Start the backend:

```sh
cd backend
npm run dev
```

4. Start the Mini App from `frontend` with the Zalo Mini App VS Code extension, or with CLI:

```sh
cd frontend
npm run zalo:login
npm run zalo:start
```

## Deploy to Zalo

Use the Zalo Mini App extension and set the Mini App ID in the Config panel, or run:

```sh
cd frontend
npm run zalo:login
npm run zalo:deploy:testing
```

Your backend must be deployed separately on a public HTTPS domain, then set `VITE_API_BASE_URL` to that domain before deploying the Mini App.

The deploy scripts run a preflight check and will stop if `VITE_API_BASE_URL` still points to `localhost`.

## Public usage checklist

1. Deploy the backend to a public HTTPS domain.
   - The backend includes `backend/Dockerfile`, so hosts that support Docker can build it from the `backend` folder.
   - The health check path is `/health`.
2. Set backend runtime env. You can copy from `backend/.env.production.example`:

```env
CLIENT_ORIGIN=https://h5.zdn.vn
ZALO_MINI_APP_ID=your-mini-app-id
ZALO_MINI_APP_SECRET=your-mini-app-secret
REQUIRE_ZALO_ACCESS_TOKEN=true
```

3. Set frontend env before deploying to Zalo. You can copy from `frontend/.env.production.example` to `frontend/.env.production`:

```env
VITE_API_BASE_URL=https://your-api-domain.example
VITE_ZALO_MINI_APP_ID=your-mini-app-id
```

4. Run `npm run zalo:deploy:testing` from `frontend`.
5. Submit the testing version for Zalo review, then release the approved version.

The Zalo login button uses `zmp-sdk` to read the Zalo user profile inside the Mini App. It will not work as a real Zalo login in a normal browser tab.

For production, set `REQUIRE_ZALO_ACCESS_TOKEN=true` so the backend rejects unsigned Zalo logins. Keep it `false` only while testing in browser/simulator flows that do not return a real Zalo token.
