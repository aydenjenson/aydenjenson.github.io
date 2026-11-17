# Your new website: launch and update guide

Everything here is written for you, not for a developer. The steps are in the order to do them.

## Where things stand (November 17, 2026)

- **The new site is online at a test address: https://aydenjenson.github.io** Open it on your computer and your phone.
- **aydenjenson.com still shows the old Adobe site.** Nothing changes for visitors until you do Step 4.
- Google is told not to list the test address, so there is no rush.
- **Everything I need from you is in one list: `docs/NEEDS-FROM-AYDEN.md`.** Start there.

## What you have

- A complete site: Home, Work, a page for each of 27 projects, Photography, Services, About, Contact, and a short Privacy page linked in the footer.
- 11 of your films play straight from the site with its own player. The other 16 play from YouTube when the visitor presses play.
- 14 projects have a silent preview loop that plays on hover. The other 13 show a still until you add a loop (see "Adding motion").
- 26 photos from your `PORTFOLIO\PHOTOS` folder on the Passport drive.
- Search setup for "videographer / cinematographer in Mankato, MN": page titles, descriptions, a Services page, a sitemap and the structured data Google reads.
- No monthly cost. Hosting is free on GitHub Pages. You keep paying only for the domain at Namecheap.

## How the home page works

- **Hover a project title:** a blurred strip of that project slides in from the side of the screen the title is on. Move away and it slides back.
- **Click a title:** the project opens across the whole screen, sharpens and plays, and the title turns into **See project**. Click that to go to the project's page.
- **Click your name:** back to the reel.
- **On a phone** there is no hover: tap a title to open it, tap **See project** to go to its page, tap your name to go back.
- The titles land in slightly different spots each visit. That is on purpose.
- Nothing follows the mouse around. The only thing that reacts to the pointer is a soft blur over your name.

**Which projects show up where**

- **The six titles over the reel** are a list you choose. Right now: SCHEELS, Reborn Legacy Tattoo, Seraphim Studios, Western Fest Rodeo, Super Bowl LIX, Bison in the Snow. To change it, tell Claude "put ____ on the home page instead of ____".
- A title only plays footage when that project has a preview loop. Seraphim Studios and Super Bowl LIX don't have one yet, so they open as a still picture that drifts slowly (see "Adding motion").
- **The "Selected work" cards** further down the home page are the projects marked as featured.

## Step 1. Look it over

Open **https://aydenjenson.github.io** and click through every page, on a computer and on your phone. Write down anything you want changed, then go through `docs/NEEDS-FROM-AYDEN.md`.

To see changes before they go online, ask Claude: **"Start the preview."** The site opens in the Browser pane.

## Step 2. Put it online (done)

This was done on November 17, 2026. Your GitHub account is `aydenjenson`, the site's files live at `github.com/aydenjenson/aydenjenson.github.io`, and every change Claude publishes shows up at `https://aydenjenson.github.io` about two minutes later.

Your real domain still shows the old Adobe site at this point. Nothing has changed for visitors yet.

## Step 3. Turn on the contact form (2 minutes)

Until you do this, the form opens the visitor's email app instead of sending by itself.

1. Go to **web3forms.com**, press "Create your Form", and enter the email address where you want inquiries to arrive.
2. They email you an "access key" (a long code). It is safe to share.
3. Tell Claude: **"My Web3Forms key is ____. Add it and publish."**

Free plan: 250 messages a month.

## Step 4. Point aydenjenson.com at the new site

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

1. **Google Business Profile** (business.google.com). Create or claim a profile for "Ayden Jenson". Choose "I deliver to / visit my customers" (a service-area business, no storefront). Category: Videographer or Video production service. Service area: Mankato and the towns you work in. Add the website, photos and a short description. This is what puts you in the map results when someone searches "videographer Mankato".
2. **Ask for reviews.** Send your Business Profile review link to recent clients. A handful of real reviews does more than any website tweak.
3. **Google Search Console** (search.google.com/search-console). Add `aydenjenson.com`, follow the verification step, then submit this sitemap: `https://aydenjenson.com/sitemap.xml`.
4. **Fix your links.** Your YouTube handle is now `@aydenjenson` (the link on the old site pointed to a handle that no longer exists). Put `aydenjenson.com` in your YouTube, Instagram and TikTok bios, and ask clients who post your videos to credit and link you.

## Updating the site

### The easy way: ask Claude

Open this project in the Claude app and say what you want. Examples:

- "Add my new video. Here's the YouTube link: ____. It's a brand promo for ____, shot in 2026."
- "Here's the export for the Seraphim Studios promo: `C:\...\seraphim.mp4`. Make the preview loop and host the full film on the site."
- "Replace photo 14 with `E:\...\DSCF1234.jpg`."
- "Remove the two music videos."
- "Feature the rodeo film first on the home page."
- "Change my contact email to ____."
- "Rewrite the Brand Films description on the Services page to say ____."

Claude makes the change, checks it and publishes it. The live site updates about two minutes later.

### By yourself, in a browser: Pages CMS

1. Go to **app.pagescms.org** and sign in with GitHub. Allow it to access the website repository.
2. Open the repository. You get forms for **Video projects** and **Site text and settings**, and a **Media** area for photos.
3. Change something and press Save. The site republishes by itself.

To add a YouTube video this way: Video projects → add an item → fill in Title, the web address name (lowercase words joined by dashes), Column, and the YouTube link → Save.

To add a photo this way: Media → Photos → open a category folder → upload. Export it from Lightroom first at about 2500 pixels on the long edge, JPEG or WebP, and start the file name with a number (`27-something.jpg`) because photos are shown in number order.

This editor has not been tried against your live repository yet. If a screen looks wrong, tell Claude and it can adjust the settings file.

### What needs Claude (or FFmpeg)

Cutting preview loops and making web-sized copies of films. These need the original video file and a tool that is installed on this PC, so ask Claude.

## Adding motion: preview loops

A preview loop is an 8 to 10 second silent clip. It is what plays when someone hovers a project, and behind your name on the home page.

These 13 projects don't have one yet and show a still instead:
Seraphim Studios, OxCB, Gigli Holidays, Iron Alliance, Super Bowl LIX, Fresh Air, New Ulm Roll In, both music videos, and four weddings (Kylie + Arnold, Justin + Veronica, Dylan + Riley, Skylar + Devin).

Do Seraphim Studios and Super Bowl LIX first, because they are two of the six titles on the home page. Fresh Air is next: it is one of the "Selected work" cards.

I searched this PC and the Passport drive for these and did not find them, so they are most likely in your Google Drive.

How to get the files:

- **Best:** the original exports from your Google Drive.
- **Fast:** YouTube Studio → Content → the three dots next to a video → Download. That gives you a 720p copy of your own upload, which is enough for a loop.

Put the files in one folder and tell Claude: **"Make preview loops from the files in `C:\...\folder`."**

The loop behind your name on the home page is a stand-in I cut from the SCHEELS, tattoo, rodeo and bison footage. When you have an export of your real reel, tell Claude to use it instead.

## What it costs

| Thing | Cost |
|---|---|
| Domain at Namecheap | what you pay now, yearly |
| Hosting (GitHub Pages) | free |
| Contact form (Web3Forms) | free up to 250 messages a month |
| Editor (Pages CMS) | free |
| Fonts (Instrument Serif, Inter Tight) | free, open licence |

GitHub Pages allows a site of about 1 GB and 100 GB of traffic a month. The site is about 250 MB now. That is plenty for a portfolio. If you ever host many long films, the videos can move to separate storage without changing the site.

One thing to know: the files for a GitHub Pages site are public. That is normal for a website, but don't put anything private in the project folder.

## The fonts

The reference sites use paid or private typefaces (Kai Blamey's is a commercial font called ABC Schengen; Xanvier Allison's files are private to his site), so they can't legally be copied. Yours uses the closest free ones: **Instrument Serif** for the large type and **Inter Tight** for the small capitals.

## Things I guessed. Please check them.

- **Contact email** is `aydenjenson23@gmail.com`, taken from one of your YouTube descriptions. No phone number is shown.
- **Project descriptions** are short and written from what I could see in the footage and your YouTube descriptions. Correct anything that is off.
- **Four projects are new to the site**, found in your Downloads folder: Old Town Vintage sale promo, Wealth From Within, Chill Connect, and The Beauty of Color Grading. I named "Chill Connect" after the file name. Remove any you don't want public.
- **Project categories**, **which six titles sit over the reel** on the home page, and **which six are the "Selected work" cards**.
- **The Privacy page** (link at the bottom of every page). I wrote it from how the site actually works. Google asks for one on any site that uses Google Analytics.
- **Services page**: the service descriptions, the five process steps, the common questions and the list of towns are my draft.
- **"Worked with" list** on the About page: Seraphim Studios, Reborn Legacy Tattoo, Gigli, Allstar Nutrition, Bodyart, Iron Alliance, OxCB. Taken from your video titles.
- **Bio**: your original text, with one sentence changed from "portrait sessions, weddings, short films, or social media content" to "a brand film, a commercial, a short film or content for social media" to match the work you want more of.
- **About portrait** is the one from your current site at the size Adobe offers (about 1200 pixels). A full-size original will look sharper.
- **The 26 photos** are my pick from your portfolio folder. Swap freely.
- **Visitor statistics**: the site keeps your existing Google Analytics tag (`G-CK0P2DL9MX`) so your numbers continue.
- **SCHEELS** is labeled as spec work on its page, with a note that it was not commissioned by SCHEELS.

## If something goes wrong

- **The live site didn't update.** On GitHub, open the **Actions** tab. A red X means the last publish failed. Tell Claude "the publish failed" and it will read the error.
- **A video won't play on the site.** Tell Claude which project.
- **You want to undo a change.** Every change is saved in history. Tell Claude "undo the last change" or "put it back how it was yesterday".
