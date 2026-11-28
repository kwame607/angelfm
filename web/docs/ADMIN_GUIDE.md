# Angel FM — Administrator Guide (for station staff)

Sign in at `https://<your-domain>/admin/login`. There is one administrator
account; there is no public registration. Everything you change appears on the
public site within about a minute.

## Daily tasks

| I want to… | Go to | Notes |
|---|---|---|
| Publish a news story | **News → New article** | Title, summary, category, picture, body. **Publish** makes it public; **Save draft** keeps it private. Set a future date to schedule it. |
| Fix or remove a story | **News →** the story | Change the status to *Draft* to hide it, or use Delete (asks to confirm). |
| Feature or flag trending | Article page | "Featured" shows it as the homepage top story; "Trending" lists it in Trending. |
| Add pictures | **Media Library** | JPG/PNG/WebP up to 5 MB. Large photos are shrunk automatically; GPS data is removed. Always fill in the description (helps accessibility and search). |
| Add a presenter | **Presenters → New** | Name, bio, photo, social links (https only). |
| Add a programme | **Programmes → New** | Tick the days, set start/end times (Ghana time, 24-hour; an end time after midnight is fine), choose presenters. Untick *Active* to hide it. |
| Run an advert | **Advertisements → New** | Pick the placement, upload the banner, set the link and start/end dates. Status shows Live / Scheduled / Expired / Paused. Ads stop automatically at the end date. |
| Update contact details | **Website Settings** | Address, phone, email, social pages. Empty fields are simply not shown on the site. |
| Change the stream | **Radio Settings** | See below. |
| Change your password | **Admin Profile** | You must enter the current password. Use 12+ characters. |

## Weekly timetable

The timetable on the **Programmes** page is built from the programmes you add under **Programmes** in the admin. There is nothing separate to maintain.

- To change a show's days or times, edit the programme and save. The timetable updates straight away.
- A show that ends after midnight (for example 11 PM to 2 AM) is listed on the day it starts.
- To take a show off the timetable without deleting it, untick **Active**.
- If two active shows overlap, a yellow warning appears at the top of the admin Programmes list. Fix the times so the timetable is clear.
- "Scheduled now" and "Up next" on the website follow the timetable and Ghana time. They do not mean the station is broadcasting live; only the Listen player shows that.

## Write with AI (news editor)

On **News → New article** (and when editing), open **Write with AI**, paste your rough notes, a statement or a press release, and press **Write draft**.

- It writes a headline, summary, article and search text **using only what you pasted**. It does not look anything up.
- Nothing is saved or published. Press **Use this draft** to put it in the form, then read it, fix it, and save or publish as usual.
- **Check before publishing** lists what the notes did not say (a name, a figure, a source). Answer those yourself; the AI is told not to guess.
- Always check names, numbers, dates and quotes against your notes. Paste quotes exactly as said.
- Limit: 12 drafts per hour per administrator. Each use is recorded in the activity log (the pasted notes are not stored).
- If the panel says it is not set up, the site administrator must add `ANTHROPIC_API_KEY` (see DEPLOYMENT.md).

## Radio Settings (stream)

1. Get from your streaming provider: the **https** stream URL and its format (MP3, AAC or HLS/.m3u8).
2. Paste it into **Stream URL**, choose the format, **Save**.
3. Use the test player on that page to confirm you hear audio.
4. Optional: **Backup stream URL** (used automatically if the main one keeps failing) and **Now-playing URL** (the provider's metadata address; the site shows the current song only if it understands the format).

The website never claims you are "Live" unless audio is genuinely playing for
the listener. If the stream is blank the site says online listening is
unavailable and points people to 96.1 FM. The FM frequency is *not* a stream address.

## If something looks wrong

| Symptom | Check |
|---|---|
| Story not visible | Status must be *Published* and the date not in the future. Wait a minute. |
| Picture upload fails | Is it under 5 MB and a real image? Is storage (R2) connected? The Media page says if not. |
| Listeners hear nothing | Is the studio encoder sending to the provider? Test the URL in the test player. Try the backup stream. |
| Ad not showing | Status must be *Live*: enabled, started, not ended; placement matches the page. |
| Locked out | Supabase dashboard → Authentication → Users → send a password recovery. |

## Good habits

- Write the summary yourself (it appears on cards and in Google/WhatsApp previews).
- Give every picture a short description.
- Don't paste text straight from Word with odd formatting; use *Clear formatting* in the editor.
- Review **Overview → Recent activity** occasionally: it logs every change.
