# /publish-cendia-post

You are the Cendia Solutions blog publishing pipeline. Run all phases below in order. Do NOT skip phases. Do NOT ask the user for input — this command is fully autonomous and gated only by automated lint.

## PHASE 1 — Topic selection

1. Read `content-pipeline/_pipeline/content-calendar.md`.
2. Pick the FIRST entry with `status: planned`. Note its slug, title, pillar, and primaryFramework.
3. If no planned entries remain, output: "Content calendar exhausted. Add new topics to content-calendar.md." and stop.

## PHASE 2 — Context loading

Read in order:
1. `content-pipeline/_pipeline/cendia-brand-voice.md` (voice rules)
2. `content-pipeline/_pipeline/cendia-frameworks.md` (framework allowlist and definitions)
3. `content-pipeline/_reference/cost-of-the-handoff-50-person-services-firm.md` (canonical structural example)
4. The 2 most recent published posts in `src/content/blog/` (most recent voice samples — skip if fewer than 2 exist)

## PHASE 3 — Drafting

Write the post to `src/content/blog/<slug>.md` with full frontmatter and body.

Hard requirements:
- Match the structural patterns from the reference post: surface-vs-structure framing, named framework anchor, specific numbers throughout, "what this isn't" section near end, closing `<div class="post-cta">` block.
- Use root-relative paths (/contact, /assessment) for all internal links.
- Closing CTA email is `support@cendiasolutions.com`.
- Author is `Cendia Solutions`.
- Anchor to the primaryFramework named in the calendar entry. Reference that framework BY ITS EXACT NAME in the body (the framework gate checks for this).
- Include AT LEAST 3 specific numbers (dollar amounts, percentages, time durations, counts) calibrated to a $5-15M revenue / 30-100 person services firm.
- Word count target: 1200-1800.
- Reading time in frontmatter = ceil(wordCount / 200).
- Frontmatter must include `primaryFramework` field matching one from the allowlist.
- Lead every H2 (except FAQ) with a 1-2 sentence direct answer. Context comes after.
- Use a markdown table for any comparison content (X vs Y, before vs after, this option vs that option).
- Optional but encouraged: end with `## FAQ` containing 3-5 `### Question` / answer pairs.

## PHASE 4 — Lint gate

Run: `node scripts/blog-pipeline/lint.mjs src/content/blog/<slug>.md`

Capture exit code.

## PHASE 5 — Disposition

**If lint passes (exit 0):**
1. Update `content-pipeline/_pipeline/content-calendar.md` — change this entry's `status: planned` to `status: published` and add `publishDate: <today YYYY-MM-DD>`.
2. Stage: `git add src/content/blog/<slug>.md content-pipeline/_pipeline/content-calendar.md` (plus any built HTML)
3. Commit: `git commit -m "blog: publish <slug>"`
4. Push: `git push origin main`
5. Output: "Published /blog/<slug>. Cloudflare Pages will deploy in ~60s."

**If lint fails (exit 1):**
1. Move the post: `mv src/content/blog/<slug>.md src/content/blog/_drafts/<slug>.md`
2. Update `content-pipeline/_pipeline/content-calendar.md` — change `status: planned` to `status: bounced` and add `bouncedDate: <today>`, `bouncedReason: <first failure from lint output>`.
3. Stage + commit the bounced state: `git add src/content/blog/_drafts/<slug>.md content-pipeline/_pipeline/content-calendar.md && git commit -m "blog: bounce <slug> to drafts (lint failure)"`
4. Output: "Bounced /blog/<slug> to _drafts/. Lint failures:" + the full lint output.
5. STOP. Do not attempt the next topic on a bounce.

## PHASE 6 — Report

Final output:
- Slug published (or bounced)
- Pillar number
- Framework anchor
- Word count
- Lint warnings (even on pass)
- Live URL once deployed: https://blog.cendiasolutions.com/blog/<slug>
- Next planned topic in calendar
