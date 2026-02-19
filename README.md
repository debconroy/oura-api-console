# Oura API Console

Test console for the [Oura Ring API v2](https://cloud.ouraring.com/v2/docs). Built with Next.js 16, Tailwind CSS v4, and Validic branding.

## Features

- **15 endpoints** across 4 resource groups (User, Daily, Detailed, Tags)
- **OAuth 2.0 flow** with scope selection, token refresh, and revocation
- **Request builder** with query parameter inputs and URL preview
- **Response viewer** with syntax-highlighted JSON, raw view, and headers
- **Request history** with session management
- **Dark/light theme** with system preference detection

## Getting Started

Requires Node.js >= 20.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuration

1. Create an application at [Oura Developer Portal](https://cloud.ouraring.com/oauth/applications)
2. Set the redirect URI to `http://localhost:3000/api/auth/callback`
3. Go to **Settings** in the console and enter your Client ID, Client Secret, and Redirect URI
4. Select scopes and click **Authorize**

## Endpoints

| Group | Endpoints |
|-------|-----------|
| **User** | Personal Info, Ring Configuration |
| **Daily** | Activity, Readiness, Sleep, SpO2, Stress |
| **Detailed** | Heart Rate, Sleep Periods, Sessions, Workouts |
| **Tags** | Enhanced Tags, Tags (deprecated), Sleep Time, Rest Mode Periods |

## OAuth Scopes

`personal` · `daily` · `heartrate` · `workout` · `tag` · `spo2` · `session`
