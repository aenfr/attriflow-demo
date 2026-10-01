# AttriFlow demo · by Fold Artists

A clickable demo that follows one AI song from idea to paycheck, and shows part of its money going
back to the artists who inspired it.

1. **Make** a song (SongSpark) and see what inspired it.
2. **Release** it (DropTune).
3. **Listen**: people play it (Streamy).
4. **Earn**: $1,000 comes in. $800 goes to the creator and $200 to the Sharing Pool.
5. **Share**: the $200 is split by the inspiration list and lands in each artist's inbox.

The apps, artists and money are pretend. The song is a real 30-second AI generation.

## Run it locally

```bash
python -m http.server 8191 -d site
```

Then open http://localhost:8191. No build step and no internet needed.

## Deploy

`render.yaml` deploys `site/` as a free Render static site.
