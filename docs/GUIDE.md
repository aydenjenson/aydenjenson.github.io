# Your new website: launch and update guide

Everything here is written for you, not for a developer. The steps are in the order to do them.

## Where things stand (November 17, 2026)

- **The site is online at your own address: https://aydenjenson.com.** You connected the domain yourself and I checked it: everything is set correctly, including the padlock (HTTPS). The old test address now forwards to it.
- **Your latest round of revisions is built but not online.** It is waiting for your answers. Start with `review/QUESTIONNAIRE.md` in this folder; the other papers from that round are beside it (what was changed, the options, the search and email reports).
- **Nothing goes online until you say so.** Claude makes a change, shows it to you in the preview on this PC, and publishes only when you say "publish".
- **Google has not read the new site yet.** It still remembers the old one. Step 5 fixes that and takes about ten minutes.
- The older list of things I need from you is `docs/NEEDS-FROM-AYDEN.md`.

## Seeing changes before they go online

Ask Claude: **"Start the preview."** The site opens in the Browser pane inside the Claude app. While the preview is running you can also open it in Chrome at `http://localhost:4321`. It only works on this PC and only while the preview is running.

**Design options page: `http://localhost:4321/lab/`** This page exists only in the preview. It is never part of the published site. It shows choices that are not built yet, using your own footage and photos. Every choice has a short code, such as "A6 page: option 2" or D4. Tell Claude the codes you want. Two bigger sets have their own pages: the photography layouts (`/lab/photos/`) and the fonts (`/lab/fonts/`). Your earlier picks are built into the site already: your name in capitals over one small line, the video page one project at a time, the before and after slider, the size of your name, the tagline, and all the wording you chose on November 18.

## What you have

- A complete site: Home, Video, a page for each of 23 projects, Photo, Services, About, Contact, and a short Privacy page linked in the footer. (The menu says Video and Photo, as you asked. The page addresses still end in `/work/` and `/photography/`.)
- 8 of your films play straight from the site with its own player. The other 15 play from YouTube when the visitor presses play.
- 11 projects have a silent preview loop that plays on hover. The other 12 show a still until you add a loop (see "Adding motion").
- 26 photos from your `PORTFOLIO\PHOTOS` folder on the Passport drive, sorted into People, Events and Branding.
- Search setup for "videographer / cinematographer in Mankato, MN": page titles, descriptions, a Services page, a sitemap and the structured data Google reads.
- No monthly cost. Hosting is free on GitHub Pages. You keep paying only for the domain at Namecheap.

## How the home page works

- **Your name** sits in the middle in capitals, with one small line close under it ("Cinematographer | Mankato, MN"). That line is always exactly as wide as your name, on every screen size. Both were made larger in the November 17 revisions: you picked the largest of the four sizes and asked for less space between the name and the line. The name is the only place that uses this font; headings everywhere else are in the serif.
- **Under the reel** is your tagline, "Create content WORTH watching." On a computer it is one centered line that runs the full width of the page. On a phone held upright it stacks as two lines of the same width. Selected Work follows straight after it.
- **Hover a project title:** a blurred strip of that project slides in from the side of the screen the title is on. Move away and it slides back.
- **Click a title:** the project opens across the whole screen, sharpens and plays, and the title turns into **See project**. Click that to go to the project's page.
- **Click your name:** back to the reel.
- **On a phone** the six titles are scattered too, one to a row: three above your name and three below, the way Xanvier's site does it. There is no hover: tap a title to open it, tap **See project** to go to its page, tap your name to go back.
- The titles land in slightly different spots each visit. That is on purpose.
- Nothing follows the mouse around. The only thing that reacts to the pointer is a soft blur over your name.
- Your Instagram, TikTok and YouTube logos are in the bottom right corner, in white. They are also in the footer and on the Contact page.

**Which projects show up where**

- **The six titles over the reel** are a list you choose. Right now: Spec Ad - SCHEELS, Reborn Legacy Tattoo, Seraphim Studios, Western Fest Stampede Rodeo, Super Bowl LIX, Bison in the Snow. To change it, tell Claude "put ____ on the home page instead of ____".
- A title only plays footage when that project has a preview loop. Seraphim Studios and Super Bowl LIX don't have one yet, so they open as a still picture that drifts slowly (see "Adding motion").
- **The "Selected Work" cards** further down the home page are the projects marked as featured.
- **Everything else** is on the Video page. It shows one project at a time: one film fills the screen, and the list of titles moves through the middle while the film behind them changes. On a computer, rest the mouse low on the list and it scrolls on by itself; rest it high and it scrolls back; the middle stays still so you can click. The title in the middle, the one that is playing, is bold. On a phone you drag the list with a finger. The buttons at the bottom filter the list.
- **No numbers.** The "01", "02" labels and the photo counts are gone, as you asked. The only numbers left do a job: the "01 / 26" counter when a photo is open full screen, the length of the reel, and the year and length on each project page.

**Color Grading Showcase (the before and after slider)**

Under "Selected Work" on the home page there is one frame with a line across it. Left of the line is the frame before your grade, right of it the finished grade. Visitors drag the line. The list beside it switches to another frame.

- Four of the six frames are real: the "before" and "after" come straight out of your film "The Beauty of Color Grading" (the barber, the tattoo, the dirt bike and the golden hour field).
- **Two are stand-ins: the SCHEELS turkey and the rodeo.** You asked for faked F-Log on those, so their "before" was made from the finished frame, tuned to match how your real ungraded frames look. Anyone who grades for a living could tell on a close look, so swap them when you can.
- **To add or replace a frame, send two pictures of the same frame:** one exported with your grade turned off and one with it on, the same size. Any still format works. Tell Claude which project it is from.
- You asked to swap the dirt bike and golden hour frames for the Evergreen wedding and Fresh Air. That is waiting on the video files: this PC has only the small YouTube thumbnails of those two.

## How every project page is written

You asked for all of them to match, so they do:

- **Title:** `Name - What it is`. Wedding films use first names only.
- **Details, always in this order:** Type, Client, Role, Camera, Year, Length. A personal film has no Client line.
- **Role** is "Cinematographer, Editor, Colorist". "Director" is added in front on commercials and pieces with planned shots.
- **Camera** is Fujifilm X-T3 on everything so far.
- Descriptions say "promotional" or "promotion", not "promo", and always "Fujifilm".
- The link under each description reads **Create something like this**. Wedding films don't have it.

## Step 1. Look it over

Open the preview (see above) and click through every page. Then open the design options page and note the codes you like. Then go through `docs/NEEDS-FROM-AYDEN.md`.

## Step 2. Put it online (done)

This was done on November 17, 2026. Your GitHub account is `aydenjenson`, the site's files live at `github.com/aydenjenson/aydenjenson.github.io`, and every change Claude publishes shows up at `https://aydenjenson.com` about a minute later.

## Step 3. Turn on the contact form (2 minutes)

Until you do this, the form opens the visitor's email app instead of sending by itself.

1. Go to **web3forms.com**, press "Create your Form", and enter the email address where you want inquiries to arrive (`aydenjensonmedia@gmail.com`).
2. They email you an "access key" (a long code). It is safe to share.
3. Tell Claude: **"My Web3Forms key is ____. Add it."**

Free plan: 250 messages a month.

## Step 4. Point aydenjenson.com at the new site (done)

**You did this, and it is correct.** Checked on November 17, 2026: the domain is saved and verified at GitHub, the four A records and the `www` record below are in place at Namecheap, the padlock certificate is issued, "Enforce HTTPS" is on, and `www.`, plain `http://` and the old test address all forward to `https://aydenjenson.com`. Your email records were left alone and still work. The full check is in `review/REPORT-DOMAIN-EMAIL.md`.

What is left of this step:

- **Adobe Portfolio** no longer receives your visitors. If you pay for it only for the website, you can turn it off. If it comes with a plan you use for other things, leave it.
- **Do not change the records below.** They are what keeps the site on your domain. The steps stay here only as a record of what was set.

You do **not** need to transfer the domain. It stays registered at Namecheap. You only change where it points. Your email forwarding is not affected as long as you leave the mail records alone.

**A. On GitHub**

1. Open your repository, then **Settings**, then **Pages** in the left menu.
2. Under **Custom domain**, type `aydenjenson.com` and press **Save**.

**B. On Namecheap**

1. Sign in, open **Domain List**, press **Manage** next to aydenjenson.com, and open the **Advanced DNS** tab.
2. In **Host Records**, delete every record whose Host is `@` or `www` and whose Type is A, AAAA, CNAME, ALIAS or URL Redirect. Those are the ones sending visitors to Adobe.
3. **Do not delete MX or TXT records.** Those are your email.
4. Add these five records:

| Type | Host | Value |
|---|---|---|
| A Record | @ | 185.199.108.153 |
| A Record | @ | 185.199.109.153 |
| A Record | @ | 185.199.110.153 |
| A Record | @ | 185.199.111.153 |
| CNAME Record | www | aydenjenson.github.io |

5. Save.

**C. Wait, then lock it**

1. The change usually shows up within an hour. It can take up to 24 hours.
2. Go back to GitHub **Settings → Pages**. When the **Enforce HTTPS** box becomes available, tick it.
3. Open `https://aydenjenson.com` and `https://www.aydenjenson.com`. Both should show the new site with a padlock.

**D. Only then, turn off Adobe Portfolio.** Keep it until the new site is working on your domain.

Old links such as `/videography` and `/about-2` forward to the new pages automatically.

## Step 5. Tell Google (about 20 minutes, and it matters more than anything on the site)

The exact clicks for each of these, checked against Google's own help pages, are in `review/REPORT-SEO-AI.md` (section 4). In short:

1. **Google Search Console first** (search.google.com/search-console). Add `aydenjenson.com`, verify it with one line added at Namecheap, submit the sitemap (`sitemap.xml`), and ask Google to read the home page. On November 17 Google still held only the old Adobe home page, so this is what gets the new site read.
2. **Google Business Profile** (business.google.com/add), with the same Google account. Use your real business name with no extra words. When asked whether customers can visit you, say no: you go to them. For the category, start typing "video" and pick the closest one Google offers ("Video production service" is what the local video companies use). Service area: Mankato and the towns you work in. Add the website, a few stills and a short description. This is what puts you on the map when someone searches "Mankato videographer". Every business on that map has one.
3. **Ask for reviews.** Send your Business Profile review link to recent clients. Never offer anything in return: Google forbids it. The video companies on the Mankato map have between 8 and 31 reviews, so a handful of real ones puts you level.
4. **Fix your links.** Your YouTube handle is `@aydenjenson`. Put `aydenjenson.com` in your YouTube, Instagram, TikTok and LinkedIn profiles, and ask clients who post your videos to credit and link you.

**About the words "videographer" and "Mankato".** The line under your name now says Cinematographer, as you asked. "Videographer" is still in the page titles, the descriptions Google shows, the footer of every page and the Services page, because that is the word local clients type into Google. "Mankato, MN" is in all of those places too. Both help.

## Sending me new videos

You said you have a lot of new work to add and may cut a new showreel. Here is what is useful.

| For | Shape | What to send |
|---|---|---|
| The video behind your name (your showreel) | Horizontal only | One file, 30 to 90 seconds. Sound does not matter: it plays silent. It loops, so a clean first and last shot helps. |
| The six titles on the home screen | Horizontal only | The finished export of each. I cut an 8 to 10 second silent preview from it. A vertical video would be cropped to a thin band here. |
| Every other project | Horizontal or vertical | The finished export. Vertical videos keep their tall shape on the Video page and on their own page. |

- **How many:** the six home titles plus as many more as are strong. About 12 to 20 projects in total is a good size. Fewer, better pieces beat a long list.
- **Format:** the normal export you would post (MP4 or MOV, 1080p or 4K). I make the web-size copies.
- **Length:** under about two minutes can play straight from the site. Longer films should be on YouTube, and I link them.
- **For each one, tell me:** the title, the client (or "personal"), one sentence about it, the year, and the YouTube link if it has one.
- **Where:** put them in one folder on this PC, for example `Documents\website-new-videos`, and tell Claude the folder.

## Updating the site

### The easy way: ask Claude

Open this project in the Claude app and say what you want. Examples:

- "Add my new video. Here's the YouTube link: ____. It's a social media promotion for ____, shot in 2026."
- "Here's the export for the Seraphim Studios video: `C:\...\seraphim.mp4`. Make the preview loop and host the full film on the site."
- "Replace photo 14 with `E:\...\DSCF1234.jpg`."
- "Put the rodeo film first on the home page."
- "Rewrite the Brand Films description on the Services page to say ____."

Claude makes the change, checks it, and shows you the preview. Nothing goes online until you say **"publish"**. When you do, aydenjenson.com updates about a minute later.

### By yourself, in a browser: Pages CMS

1. Go to **app.pagescms.org** and sign in with GitHub. Allow it to access the website repository.
2. Open the repository. You get forms for **Video projects** and **Site text and settings**, and a **Media** area for photos.
3. Change something and press Save. This publishes straight away, with no preview.

To add a YouTube video this way: Video projects → add an item → fill in Title, the web address name (lowercase words joined by dashes), Column, Client, Role, Camera and the YouTube link → Save.

To add a photo this way: Media → Photos → open a category folder → upload. Export it from Lightroom first at about 2500 pixels on the long edge, JPEG or WebP, and start the file name with a number (`27-something.jpg`) because photos are shown in number order.

This editor has not been tried against your live repository yet. If a screen looks wrong, tell Claude and it can adjust the settings file.

### What needs Claude (or FFmpeg)

Cutting preview loops and making web-sized copies of films. These need the original video file and a tool that is installed on this PC, so ask Claude.

## Adding motion: preview loops

A preview loop is an 8 to 10 second silent clip. It is what plays when someone hovers a project, and behind your name on the home page.

These 12 projects don't have one yet and show a still instead:
Seraphim Studios, OxCB, Iron Alliance, Super Bowl LIX, Fresh Air, New Ulm Roll In, both music videos, and four weddings (Kylie + Arnold, Justin + Veronica, Dylan + Riley, Skylar + Devin).

Do Seraphim Studios and Super Bowl LIX first, because they are two of the six titles on the home page. Fresh Air is next: it is one of the "Selected work" cards.

I searched this PC and the Passport drive for these and did not find them, so they are most likely in your Google Drive.

How to get the files:

- **Best:** the original exports from your Google Drive.
- **Fast:** YouTube Studio → Content → the three dots next to a video → Download. That gives you a 720p copy of your own upload, which is enough for a loop.

Put the files in one folder and tell Claude: **"Make preview loops from the files in `C:\...\folder`."**

The loop behind your name on the home page is a stand-in I cut from the SCHEELS, tattoo, rodeo and bison footage. When you have your new showreel, tell Claude to use it instead.

## What it costs

| Thing | Cost |
|---|---|
| Domain at Namecheap | what you pay now, yearly |
| Hosting (GitHub Pages) | free |
| Contact form (Web3Forms) | free up to 250 messages a month |
| Editor (Pages CMS) | free |
| Fonts (Instrument Serif, Inter Tight) | free, open license |

GitHub Pages allows a site of about 1 GB and 100 GB of traffic a month. The site is about 185 MB now. That is plenty for a portfolio. If you ever host many long films, the videos can move to separate storage without changing the site.

**The site's files are public on GitHub, and that is fine.** Everything in them is already on the website for anyone to see. There are no passwords in them. Notes that name your folders or unpublished client work are kept on this PC only. Paying about $4 a month to make the files private would not make the site any safer, so I don't recommend it. Just don't put anything private in the project folder.

## Visitor numbers (Google Analytics)

Your old site had a Google Analytics tag: a small piece of code that counts visitors and shows which pages they open and how they found you. I moved the same tag (`G-CK0P2DL9MX`) to the new site, so your numbers carry on in the same account. To see them, sign in at **analytics.google.com** with the Google account that set it up. You don't need to do anything else.

## The fonts

The reference sites use paid or private typefaces (Kai Blamey's is a commercial font called ABC Schengen; Xanvier Allison's files are private to his site), so they can't legally be copied. Yours uses the closest free ones: **Instrument Serif** for the large type and **Inter Tight** for the small capitals. Your name on the home screen is set in Inter Tight capitals, which you picked from nine options.

## Still worth checking

- **Project categories.** Which group each project sits in on the Video page (Brand & Commercial, Creative & Film, Weddings).
- **"Director"** was added to the role on: Spec Ad - SCHEELS, Reborn Legacy Tattoo, Seraphim Studios, the Allstar Nutrition giveaway, OxCB, both music videos, and Justin + Veronica. Say if any should not have it.
- **Services page.** "How It Works" and "Common questions" are removed, as you asked. The title, the description, and the text for Brand Films, Commercials, and Social Media are the ones you picked on November 18. The text in the Photography row is still my draft.
- **Commas.** Every list on the site is now written "x, y, and z", with a comma before "and", as you asked. Tell Claude if you spot one that was missed.
- **"Worked with" list** on the About page. You said you want to add and remove names.
- **Bio.** A short placeholder, written on November 17. A proper one is waiting on your answers to the interview questions (number 31 in `review/QUESTIONNAIRE.md`).
- **About portrait** is the one from your old site at the size Adobe offers (about 1200 pixels). A full-size original will look sharper.
- **The 26 photos** are my pick from your portfolio folder. Four of them (a gas pump, a diner, a turkey in the woods, a trail) don't fit People, Events or Branding. They show under "All" only until you decide.
- **The Privacy page** was rewritten to be shorter and more formal. Read it once.

## If something goes wrong

- **The live site didn't update.** On GitHub, open the **Actions** tab. A red X means the last publish failed. Tell Claude "the publish failed" and it will read the error.
- **A video won't play on the site.** Tell Claude which project.
- **You want to undo a change.** Every change is saved in history. Tell Claude "undo the last change" or "put it back how it was yesterday".
- **The preview address doesn't open.** The preview is not running. Ask Claude to start it.
