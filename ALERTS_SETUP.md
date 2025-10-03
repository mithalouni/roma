# Domain Alert System Setup Guide

This guide explains how to configure and use the domain alert system in Doma Analytics.

## Overview

The alert system allows users to receive personalized domain recommendations via email based on:
- Their favorite domains
- Domains they own
- Market trends
- Custom keywords

Emails are generated using Gemini AI and sent via Maileroo API.

## Architecture

### Components

1. **AlertsTab Component** (`src/components/AlertsTab.tsx`)
   - User interface for creating and managing alerts
   - Located in the Portfolio page under the "Alerts" tab

2. **Database Schema** (`user_alerts` table)
   - Stores alert preferences and scheduling information
   - Created via Supabase migration

3. **Edge Functions**
   - `send-domain-alert`: Generates and sends individual emails
   - `scheduled-alerts`: Cron job to process scheduled alerts

## Setup Instructions

### 1. Supabase Secrets

You need to set the following secrets in your Supabase project:

```bash
# Navigate to Supabase Dashboard > Project Settings > Edge Functions > Secrets

# Required secrets:
MAILEROO_API_KEY=2c3fd4667ad6276c87096197bea17af46d29415803ca4ea1fb393a51ace29c8e
GEMINI_API_KEY=AIzaSyCPl_k64zVSRZKbDjAHxStCcnYwJ7uLdxk
SUPABASE_URL=https://bxlksmhjzndopuavihlw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

**To set secrets via CLI:**

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref bxlksmhjzndopuavihlw

# Set secrets
supabase secrets set MAILEROO_API_KEY=2c3fd4667ad6276c87096197bea17af46d29415803ca4ea1fb393a51ace29c8e
supabase secrets set GEMINI_API_KEY=AIzaSyCPl_k64zVSRZKbDjAHxStCcnYwJ7uLdxk
supabase secrets set SUPABASE_URL=https://bxlksmhjzndopuavihlw.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

**Get your Service Role Key:**
1. Go to Supabase Dashboard
2. Navigate to: Settings > API
3. Copy the `service_role` key (NOT the anon key)

### 2. Configure Maileroo Email Domain (Optional but Recommended)

For production use, configure a custom domain in Maileroo:

1. Go to [Maileroo Dashboard](https://maileroo.com/domains)
2. Add your domain (e.g., `doma.xyz`)
3. Update DNS records as instructed
4. Update the `from` field in `send-domain-alert` function:
   ```typescript
   from: {
     address: 'alerts@yourdomain.com',
     display_name: 'Doma Analytics'
   }
   ```

For testing, the current Maileroo account can send from `noreply@doma.xyz` without additional setup.

### 3. Set Up Cron Job

To automatically send scheduled alerts, set up a cron job in Supabase:

**Option A: Using Supabase Dashboard**
1. Go to Database > Cron Jobs (requires pg_cron extension)
2. Create a new cron job:
   ```sql
   SELECT cron.schedule(
     'send-scheduled-alerts',
     '0 9 * * *', -- Run daily at 9 AM UTC
     $$
     SELECT net.http_post(
       url := 'https://bxlksmhjzndopuavihlw.supabase.co/functions/v1/scheduled-alerts',
       headers := '{"Content-Type": "application/json", "Authorization": "Bearer <service-role-key>"}'::jsonb
     );
     $$
   );
   ```

**Option B: Using External Cron Service (e.g., GitHub Actions)**

Create `.github/workflows/scheduled-alerts.yml`:
```yaml
name: Send Scheduled Alerts
on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  send-alerts:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Edge Function
        run: |
          curl -X POST \
            https://bxlksmhjzndopuavihlw.supabase.co/functions/v1/scheduled-alerts \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"
```

## How It Works

### User Flow

1. **Connect Wallet**: User connects their wallet on the Portfolio page
2. **Navigate to Alerts Tab**: Click the "Alerts" tab
3. **Create Alert**:
   - Enter email address
   - Select tracking options (favorites, owned domains, trends, custom keywords)
   - Choose frequency (daily, weekly, monthly)
   - Click "Create Alert & Send Now"
4. **Receive First Email**: Immediately receives a personalized email
5. **Scheduled Emails**: Receives future emails based on selected frequency

### Email Generation Process

1. **Data Collection**:
   - Fetch user's favorite domains from `domain_favorites` table
   - Query Doma subgraph for user's owned domains
   - Get trending domains and market data
   - Filter based on custom keywords

2. **AI Content Generation**:
   - Send collected data to Gemini AI
   - Gemini generates personalized recommendations
   - Formats email with HTML/CSS

3. **Email Delivery**:
   - Send via Maileroo API
   - Track delivery status
   - Update `last_sent_at` and `next_send_at` in database

### Email Content

Each email includes:
- Personalized greeting
- Summary of tracking preferences
- 3-5 AI-powered domain recommendations
- Market insights and trends
- Call-to-action to visit dashboard
- Professional signature

## Database Schema

```sql
CREATE TABLE user_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  email TEXT NOT NULL,

  -- Alert preferences
  track_favorites BOOLEAN DEFAULT false,
  track_my_domains BOOLEAN DEFAULT false,
  track_trends BOOLEAN DEFAULT false,
  track_other TEXT,

  -- Scheduling
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  last_sent_at TIMESTAMP WITH TIME ZONE,
  next_send_at TIMESTAMP WITH TIME ZONE,

  -- Status
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Testing

### Manual Testing

1. **Test Alert Creation**:
   - Connect wallet on Portfolio page
   - Go to Alerts tab
   - Create a test alert with your email
   - Check inbox for immediate email

2. **Test Scheduled Function**:
   ```bash
   curl -X POST \
     https://bxlksmhjzndopuavihlw.supabase.co/functions/v1/scheduled-alerts \
     -H "Authorization: Bearer <service-role-key>"
   ```

3. **Check Logs**:
   - Go to Supabase Dashboard > Edge Functions
   - Click on function name to view logs
   - Check for errors or successful sends

### Troubleshooting

**Email not received?**
- Check spam/junk folder
- Verify Maileroo API key is correct
- Check Edge Function logs for errors
- Ensure email address is valid

**Gemini API errors?**
- Verify API key is correct and has quota
- Check API key has Gemini API enabled
- Review prompt length (may need to reduce data sent)

**Alert not scheduled?**
- Verify `next_send_at` is set correctly in database
- Check cron job is running
- Review `scheduled-alerts` function logs

## API Endpoints

### Send Immediate Alert
```
POST https://bxlksmhjzndopuavihlw.supabase.co/functions/v1/send-domain-alert
```

**Request Body:**
```json
{
  "wallet_address": "0x...",
  "email": "user@example.com",
  "preferences": {
    "track_favorites": true,
    "track_my_domains": true,
    "track_trends": false,
    "track_other": "crypto, AI"
  },
  "immediate": true
}
```

### Process Scheduled Alerts
```
POST https://bxlksmhjzndopuavihlw.supabase.co/functions/v1/scheduled-alerts
```

No request body required. This endpoint:
- Finds all alerts due to be sent
- Processes each one via `send-domain-alert`
- Updates `last_sent_at` and `next_send_at`

## Environment Variables

**.env (Frontend)**
```bash
VITE_SUPABASE_URL=https://bxlksmhjzndopuavihlw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GEMINI_API_KEY=AIzaSyCPl_k64zVSRZKbDjAHxStCcnYwJ7uLdxk
```

**Supabase Secrets (Edge Functions)**
```bash
MAILEROO_API_KEY=2c3fd4667ad6276c87096197bea17af46d29415803ca4ea1fb393a51ace29c8e
GEMINI_API_KEY=AIzaSy...
SUPABASE_URL=https://bxlksmhjzndopuavihlw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Security Considerations

1. **RLS Policies**: Row Level Security is enabled on `user_alerts` table
2. **Service Role Key**: Never expose in frontend code
3. **Email Validation**: Validate email format before saving
4. **Rate Limiting**: Consider adding rate limits to prevent abuse
5. **API Keys**: Store in Supabase secrets, not in code

## Future Enhancements

- [ ] Email templates with better styling
- [ ] Unsubscribe links
- [ ] Email open tracking
- [ ] A/B testing for recommendations
- [ ] User feedback on recommendations
- [ ] Export alert history
- [ ] Multiple email addresses per alert
- [ ] SMS notifications option

## Support

For issues or questions:
- Check Edge Function logs in Supabase Dashboard
- Review this documentation
- Check Maileroo delivery logs at https://maileroo.com/dashboard
- Verify all API keys are correct
