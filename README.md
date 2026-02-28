# 💬 Google Chat DM — Apps Script

**Send Google Chat direct messages to individual users from Google Sheets using Google Apps Script.**

A free, open-source tool for Google Workspace organizations (businesses, schools, nonprofits) to send personal Chat DMs directly from a spreadsheet — with a polished sidebar UI, bulk sending, filtering, rate limiting, and full send logging.

![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-V8-blue?logo=google)
![License](https://img.shields.io/badge/license-MIT-green)
![Google Workspace](https://img.shields.io/badge/Google%20Workspace-Required-orange?logo=google)

---

## ✨ Features

- **Direct Messages** — Send personal DMs to any user in your Google Workspace domain
- **Sidebar UI** — A polished compose interface inside Google Sheets with search, filtering, and multi-select
- **Bulk Sending** — Select multiple recipients and send with one click
- **Recipient Management** — Organize recipients by school/organization, role, and group
- **IMPORTRANGE Support** — Pull recipient lists from other spreadsheets (e.g., student databases, HR systems)
- **Rate Limiting** — Configurable rate limit to stay within Google Chat API quotas
- **Send Log** — Automatic audit trail of every message sent, with color-coded status
- **Rich Card Messages** — Send formatted card messages with headers and timestamps (via script)
- **No Bot Required** — Messages appear from *your* Google account, not a bot. No prior interaction needed.
- **Completely Free** — Uses Google's free APIs with no third-party services

---

## 📋 Requirements

| Requirement | Details |
|---|---|
| **Google Workspace** | Any paid plan (Business, Enterprise, Education, Nonprofits). **Free Gmail accounts will NOT work.** |
| **Google Cloud Project** | Free — needed only to enable the Chat API (~10 min one-time setup) |
| **Admin Access** | Not required. Any Workspace user can set this up for their domain. |

---

## 🚀 Setup Guide

### Step 1: Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a **new blank spreadsheet**
2. Name it whatever you like (e.g., `Chat DMs`, `Staff Messenger`, etc.)

### Step 2: Add the Apps Script Code

1. In your new spreadsheet, go to **Extensions → Apps Script**
2. The Apps Script editor will open in a new tab
3. Delete the default `Code.gs` content
4. Create the following files and paste the code from this repository:

| File | Type | Source |
|---|---|---|
| `Code.gs` | Script | [Code.gs](Code.gs) |
| `ChatDM.gs` | Script | [ChatDM.gs](ChatDM.gs) |
| `RecipientManager.gs` | Script | [RecipientManager.gs](RecipientManager.gs) |
| `MessageEngine.gs` | Script | [MessageEngine.gs](MessageEngine.gs) |
| `SendLogger.gs` | Script | [SendLogger.gs](SendLogger.gs) |
| `Sidebar.html` | HTML | [Sidebar.html](Sidebar.html) |

> **Tip**: To create a new file in the Apps Script editor, click the **+** button next to "Files" and select "Script" (for `.gs` files) or "HTML" (for `.html` files).

5. Click on the **gear icon** (⚙️) in the left sidebar → **Project Settings**
6. Check **"Show 'appsscript.json' manifest file in editor"**
7. Go back to the editor, click on `appsscript.json`, and replace its content with the [appsscript.json](appsscript.json) from this repo
8. **Save all files** (Cmd+S / Ctrl+S)

### Step 3: Set Up Google Cloud Project (One-Time, ~10 minutes)

You need a GCP project to enable the Google Chat API. This is free.

#### 3a. Create or select a GCP project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one):
   - Click the project dropdown at the top → **New Project**
   - Name it something like `Chat DMs` or `Workspace Automations`
   - Click **Create**

#### 3b. Enable the Google Chat API

1. In your GCP project, go to **APIs & Services → Library**
   - Direct link: `https://console.cloud.google.com/apis/library`
2. Search for **"Google Chat API"**
3. Click on it and click **Enable**

#### 3c. Configure the OAuth Consent Screen

1. Go to **APIs & Services → OAuth consent screen**
   - Direct link: `https://console.cloud.google.com/apis/credentials/consent`
2. Select **Internal** (this makes it available only to your organization)
3. Fill in:
   - **App name**: `Chat DMs` (anything you like)
   - **User support email**: your email
   - **Developer contact email**: your email
4. Click **Save and Continue** through the remaining steps (no changes needed)

#### 3d. Configure the Google Chat API App

1. Go to: **APIs & Services → Google Chat API → Configuration**
   - Or search for the Google Chat API in the Enabled APIs list and click on it, then go to the **Configuration** tab
2. Fill in:
   - **App name**: `Chat DMs` (anything descriptive)
   - **Avatar URL**: leave blank (or optionally add your org logo URL)
   - **Description**: `Direct messaging system`
   - **Enable Interactive features**: **OFF**
   - **Visibility**: **Specific people and groups** → add your email
3. Click **Save**

#### 3e. Link the GCP Project to Apps Script

1. In your GCP project dashboard, note the **Project Number** (shown on the Home page)
2. Go back to the **Apps Script editor** → **Project Settings** (gear icon)
3. Under "Google Cloud Platform (GCP) Project", click **Change project**
4. Enter your GCP **project number** and click **Set project**

### Step 4: Initialize and Test

1. Go back to your **Google Sheet** and refresh the page
2. You should see a **💬 Chat DM** menu in the menu bar
3. Click **💬 Chat DM → ⚙️ Setup → Initialize Sheet Tabs** — this creates the Recipients, Send Log, and Config tabs
4. Click **💬 Chat DM → 📨 Send Test to Myself**
   - Note: Google Chat doesn't allow DMs to yourself, so it'll prompt for a colleague's email
   - Enter a colleague's Workspace email and send
   - The first time, Google will ask you to authorize the app — click through to approve
5. Ask your colleague to check their Google Chat — they should have received the message!

---

## 📖 Usage

### Adding Recipients

Go to the **Recipients** tab and add your users:

| Name | Email | School | Role | Group | Active |
|---|---|---|---|---|---|
| Alice Johnson | alice@example.com | Main Campus | Staff | Teachers | TRUE |
| Bob Smith | bob@example.com | Main Campus | Student | Class 10-A | TRUE |
| Carol Davis | carol@example.com | West Branch | Staff | Admin | TRUE |

- **School/Role/Group**: These are filter categories — name them however makes sense for your organization
- **Active**: Set to `FALSE` to temporarily exclude someone without deleting their row
- **IMPORTRANGE**: You can use `=IMPORTRANGE("spreadsheet_url", "Sheet!A:F")` to pull data from another spreadsheet (e.g., an HR database or student information system)

### Sending Messages

1. Click **💬 Chat DM → 📝 Compose Message** to open the sidebar
2. **Search/filter** recipients by name, email, school, role, or group
3. **Select** recipients (checkboxes) — use "Select All" for bulk sends
4. **Type** your message — supports Google Chat formatting:
   - `*bold*` for **bold**
   - `_italic_` for _italic_
   - `~strikethrough~` for ~~strikethrough~~
5. Click **Send Message**

### Checking the Send Log

The **Send Log** tab automatically records:
- Timestamp, recipient name, email, message preview, status, and who sent it
- Status cells are color-coded: 🟢 green = sent, 🔴 red = failed

### Configuration

The **Config** tab lets you customize:

| Setting | Default | Description |
|---|---|---|
| School 1/2/3 Name | _(blank)_ | Names of your schools/locations (for reference) |
| Default Message Title | School Notification | Default title for card messages |
| Rate Limit (messages per minute) | 30 | Pause after this many sends to avoid API rate limits |
| Enable Send Log | TRUE | Toggle send logging on/off |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Google Sheet                        │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐ │
│  │Recipients│ │ Send Log │ │ Config │ │ Sheet1   │ │
│  └──────────┘ └──────────┘ └────────┘ └──────────┘ │
└───────────────────────┬─────────────────────────────┘
                        │
            ┌───────────┴───────────┐
            │    Apps Script        │
            │                       │
            │  Code.gs ──────────── │ ← Menu, sidebar, handlers
            │  ChatDM.gs ───────── │ ← Chat API layer
            │  RecipientManager.gs  │ ← Read/filter recipients
            │  MessageEngine.gs ─── │ ← Bulk send + rate limiting
            │  SendLogger.gs ────── │ ← Audit trail
            │  Sidebar.html ─────── │ ← Compose UI
            │  appsscript.json ──── │ ← Manifest + OAuth scopes
            │                       │
            └───────────┬───────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │  Google Chat API v1   │
            │  (Advanced Service)   │
            │                       │
            │  • Spaces.setup()     │ ← Create/find DM space
            │  • Messages.create()  │ ← Send the message
            │                       │
            │  User Authentication  │ ← Messages appear from YOU
            └───────────────────────┘
```

### Key Design Decisions

- **User auth, not bot auth**: Messages come from the person running the script, making them feel personal and trustworthy
- **IIFE module pattern**: Each `.gs` file is wrapped in an IIFE to avoid global namespace pollution
- **Rate limiting**: Configurable via the Config tab to prevent hitting API quotas
- **Idempotent DM setup**: `Chat.Spaces.setup()` finds existing DM spaces rather than creating duplicates

---

## ⚠️ Known Limitations

| Limitation | Details |
|---|---|
| **Workspace only** | Free/personal Gmail accounts cannot use the Chat API |
| **Can't DM yourself** | Google Chat API prevents creating a DM space with yourself |
| **Same domain only** | You can only DM users within your Google Workspace domain |
| **API quotas** | Google Chat API has [usage limits](https://developers.google.com/chat/api/guides/quotas) — the built-in rate limiter helps avoid hitting them |
| **No scheduled messages** | Currently all sends are immediate (scheduled sends are a planned enhancement) |

---

## 🔧 Customization

### Changing the Timezone

Edit `appsscript.json` and change the `timeZone` value:

```json
{
  "timeZone": "America/New_York",
  ...
}
```

See [supported timezone values](https://developers.google.com/apps-script/reference/base/session#getScriptTimeZone()).

### Sending Card Messages (Programmatic)

The `ChatDM` module supports rich card messages. You can call this from the script editor or a custom function:

```javascript
ChatDM.sendCardMessage(
  'user@yourdomain.com',
  'Meeting rescheduled to 3 PM tomorrow.',
  'Schedule Update',       // Card title
  'From the Admin Office'  // Card subtitle
);
```

### Sending to Groups/Schools (Programmatic)

```javascript
// Send to all recipients in a group
MessageEngine.sendToGroup('Class 10-A', 'Reminder: Field trip tomorrow!');

// Send to all recipients at a school/location
MessageEngine.sendToSchool('Main Campus', 'Campus closed Friday for maintenance.');
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

### Ideas for Enhancement

- [ ] Scheduled/deferred message sending
- [ ] Message templates (reusable, stored in Config)
- [ ] Delivery read receipts
- [ ] Bulk import/export of recipients
- [ ] Dashboard with send analytics

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

Built with:
- [Google Apps Script](https://developers.google.com/apps-script)
- [Google Chat API](https://developers.google.com/chat)
- [Google Sheets](https://sheets.google.com)

Originally developed for K-12 schools using Google Workspace for Education, but works for any Google Workspace organization.
