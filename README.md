# dukeaeroplane.com

Static recreation of the Duke Aeroplane (Galen Cassidy Peria) website, originally
built on Weebly. Plain HTML/CSS/JS — no build step, no framework, no CMS. Deploy
by copying the whole folder to any static host.

## Structure

```
index.html                  Home
musics.html                 Music (SoundCloud players by release)
words.html                  Words (lyrics placeholder)
theheartbeatthehammer.html  The film: trailer, synopsis, bios, credits, stills
media.html                  Photo gallery + music videos
merch.html                  Higher Ground vinyl/digital
epk.html                    Press kit: quotes, bio, tracks, press photos
dates.html                  Live dates
contact.html                Contact form + mailing address
css/style.css               Single shared stylesheet
js/main.js                  Mobile nav toggle + gallery lightbox (vanilla JS)
images/                     All photos/artwork pulled from the original site
video/                      Self-hosted trailer for "The Heartbeat, The Hammer"
```

Page filenames match the original site (`musics.html`, `epk.html`, …) so any
existing inbound links keep working after the DNS move.

## Design notes

The look preserves the original theme: `#242424` page background, black content
well, red accents (`#BE1E2D` / `#C23B3B`), red footer band, Josefin Slab
uppercase headings, Josefin Sans nav, Quicksand body text (loaded from Google
Fonts). Layout is rebuilt responsive: sticky nav collapses to a menu button
under 700px (with tightened type between 700–1024px so the full bar fits),
the Media page photo gallery is a swipeable carousel with a lightbox, other
galleries are CSS grid with the same lightbox (keyboard arrows + swipe), and
video embeds are fluid 16:9. Colors were nudged for WCAG AA contrast where
needed (nav red #d63e4a, white footer text); the heading red #c23b3b is
original and used only at large text sizes. When editing css/style.css or
js/main.js, bump the ?v= query on their links in all pages so browsers pick
up the change.

## Things to finish before/after launch

1. **Contact form** — the old form posted to Weebly's servers, which won't
   exist after the move. The form on `contact.html` points at
   `https://formspree.io/f/YOUR_FORM_ID`. Create a free form at
   [formspree.io](https://formspree.io) (or any similar service — Web3Forms,
   Basin, Netlify Forms if hosting on Netlify) and replace `YOUR_FORM_ID`.
   The direct booking email link was removed for professionalism/security;
   the contact form is now the only online contact method.
2. **Newsletter** — the signup form was removed for now (no active newsletter).
   Weebly still has the old subscriber list; export it from the Weebly
   dashboard before closing the account, for whenever a newsletter is set up.
3. **Trailer video** — `video/heartbeat-trailer.mp4` (47 MB) is served
   directly. Fine on most hosts; if bandwidth becomes a concern, upload it
   unlisted to YouTube/Vimeo and swap the `<video>` tag for an iframe embed.
4. **Analytics** — the old Google Analytics (legacy ga.js, UA-7870337-1) was
   not carried over; UA properties stopped working in 2023 anyway. Add a GA4 or
   Plausible/Fathom snippet if desired.
5. **Copyright year** — currently hard-coded to 2026 in each page footer.

## Hosting

Any static host works: Netlify, Cloudflare Pages, GitHub Pages, or a plain
nginx/Apache box. Point the `dukeaeroplane.com` DNS at the new host and make
sure `index.html` is the directory index. No server-side code is required.
