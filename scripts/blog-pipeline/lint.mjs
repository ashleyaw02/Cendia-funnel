#!/usr/bin/env node
/**
 * Cendia Solutions blog post lint
 * Usage: node scripts/blog-pipeline/lint.mjs <path-to-post.md>
 * Exit 0 = passes all gates. Exit 1 = lint failure (post drops to _drafts/).
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const args = process.argv.slice(2);
const postPath = args[0];

if (!postPath) {
  console.error('Usage: lint.mjs <post.md>');
  process.exit(2);
}

const content = readFileSync(resolve(postPath), 'utf8');
const failures = [];
const warnings = [];

// ===== HARD GATES (any failure = drop to _drafts) =====

// Brand name violations
if (/\bCendia Solution\b(?!s)/.test(content)) {
  failures.push('Found "Cendia Solution" without trailing s. Brand is "Cendia Solutions".');
}

// Frontmatter completeness
const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
if (!fmMatch) {
  failures.push('Missing frontmatter block.');
} else {
  const fm = fmMatch[1];
  const required = ['slug', 'title', 'description', 'publishDate', 'author', 'category', 'readingTime', 'primaryFramework'];
  for (const field of required) {
    if (!new RegExp(`^${field}:`, 'm').test(fm)) {
      failures.push(`Missing frontmatter field: ${field}`);
    }
  }
  if (!/author:\s*Cendia Solutions/.test(fm)) {
    failures.push('Author must be "Cendia Solutions" (company-led voice rule).');
  }
}

// Voice: banned phrases
const bannedPhrases = [
  /in today's fast-paced/i,
  /it's important to note/i,
  /it's worth noting/i,
  /in conclusion/i,
  /to summarize/i,
  /game.?changer/i,
  /\brobust\b/i,
  /\bseamless\b/i,
  /\bleverage\b/i,
  /\bempower/i,
  /\bsynergy\b/i,
  /\bdisrupt\b/i,
  /delve into/i,
  /navigate the complexities/i,
  /paradigm shift/i,
  /move the needle/i,
];
for (const re of bannedPhrases) {
  if (re.test(content)) {
    failures.push(`Banned phrase / AI-tell detected: ${re}`);
  }
}

// Founder-voice violations
if (/\bI built this\b/i.test(content)) failures.push('Founder-voice detected: "I built this".');
if (/\bmy team and I\b/i.test(content)) failures.push('Founder-voice detected: "my team and I".');
if (/\bwhen I was running\b/i.test(content)) failures.push('Founder-voice detected: personal anecdote.');
if (/\bin my experience\b/i.test(content)) failures.push('Founder-voice detected: "in my experience".');

// Body extraction
const body = content.replace(/^---\n[\s\S]*?\n---/, '');

// Anaphora detection: 4+ consecutive sentences starting with the same word
const paragraphs = body.split(/\n\n+/);
for (const para of paragraphs) {
  if (/^[#|*\->`]/.test(para.trim())) continue;
  if (/^<\w/.test(para.trim())) continue;
  const sentences = para.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
  if (sentences.length < 4) continue;
  let runStart = null;
  let runWord = null;
  for (let i = 0; i < sentences.length; i++) {
    const firstWord = (sentences[i].match(/^([A-Za-z']+)/) || [, ''])[1].toLowerCase();
    if (!firstWord) { runStart = null; runWord = null; continue; }
    if (firstWord === runWord) {
      if (i - runStart + 1 >= 4) {
        failures.push(`Anaphora detected: 4+ consecutive sentences starting with "${firstWord}". Vary sentence openings.`);
        break;
      }
    } else {
      runStart = i;
      runWord = firstWord;
    }
  }
}

// Antithetical parallelism detection
const antitheticalPatterns = [
  /\bIt[''\u2019]?s not about [^.!?]+[.!?]\s+It[''\u2019]?s about\b/i,
  /\bThis is not (a|an|the) [^.!?]+[.!?]\s+This is (a|an|the)\b/i,
  /\bThat[''\u2019]?s not [^.!?]+[.!?]\s+That[''\u2019]?s\b/i,
  /\bNot (a|an|the|just) [^.!?]+[.!?]\s+(A|An|The)\b/,
];
for (const re of antitheticalPatterns) {
  const m = content.match(re);
  if (m) {
    failures.push(`Antithetical parallelism detected: "${m[0].slice(0, 100)}..."`);
  }
}

// Structural requirements
const h1Count = (body.match(/^# /gm) || []).length;
if (h1Count !== 1) failures.push(`Expected exactly 1 H1 in body. Found ${h1Count}.`);
if (!/<p class="lead">/.test(content)) failures.push('Missing <p class="lead"> wrapper on lead paragraph.');
if (!/<div class="post-cta">/.test(content)) failures.push('Missing <div class="post-cta"> closing block.');

// Absolute URL violation (check body only, frontmatter canonical is exempt)
if (/https?:\/\/cendiasolutions\.com\//.test(body)) {
  failures.push('Use root-relative paths (/contact, /assessment) instead of absolute cendiasolutions.com URLs.');
}

// Pill border-radius (forbidden in blog)
if (/border-radius:\s*100px/.test(content)) {
  failures.push('100px (pill) border-radius forbidden in blog.');
}

// ===== FRAMEWORK GATE (hard fail) =====
const frameworksPath = join(__dirname, '..', '..', 'content-pipeline', '_pipeline', 'cendia-frameworks.md');
let allowedFrameworks = [];
try {
  const frameworksFile = readFileSync(frameworksPath, 'utf8');
  const matches = frameworksFile.match(/^### (.+?)$/gm) || [];
  allowedFrameworks = matches.map(m => m.replace(/^### /, '').trim());
} catch {
  allowedFrameworks = [
    'Three-Layer Compliance Model', 'Handoff Cost Model', '2-Minute Rule (Automation Triage)',
    'The Surface vs. Structure Lens', 'Eliminate-Before-Automate', 'Cost-Per-Workflow',
    'The Margin Leak Map', 'Build vs. Buy vs. Eliminate', 'Fractional vs. Internal vs. Consulting',
    '30/90/365 Sizing', 'The Three-to-One Rule',
  ];
}

// Check primaryFramework in frontmatter
if (fmMatch) {
  const primaryMatch = fmMatch[1].match(/^primaryFramework:\s*(.+)$/m);
  if (primaryMatch) {
    const primary = primaryMatch[1].trim().replace(/^["']|["']$/g, '');
    if (!allowedFrameworks.some(f => f === primary || f.includes(primary) || primary.includes(f))) {
      failures.push(`FRAMEWORK GATE: primaryFramework "${primary}" is not in the allowlist. Add it to cendia-frameworks.md or pick a different framework.`);
    }
  }
}

// Check body references at least one framework by name
const referencedFrameworks = allowedFrameworks.filter(f => {
  const cleanName = f.replace(/\s*\(.+\)\s*$/, '').trim();
  return content.includes(cleanName);
});
if (referencedFrameworks.length === 0) {
  failures.push('FRAMEWORK GATE: Post does not reference any allowlisted Cendia framework by name. Every post must anchor to at least one named framework from cendia-frameworks.md.');
}

// ===== NUMBERS GATE (hard fail) =====
const numberPatterns = [
  /\$\d[\d,]*(?:\.\d+)?[KMB]?/g,
  /\b\d+(?:\.\d+)?%/g,
  /\b\d+(?:-\d+)?\s*(?:hours?|days?|weeks?|months?|years?|minutes?)\b/gi,
  /\b\d+(?:-\d+)?\s*(?:people|person|employees?|firms?|clients?|projects?|handoffs?)\b/gi,
  /\b\d+x\b/gi,
];
let numbersFound = 0;
for (const re of numberPatterns) {
  const matches = content.match(re) || [];
  numbersFound += matches.length;
}
if (numbersFound < 3) {
  failures.push(`NUMBERS GATE: Only ${numbersFound} specific numbers found. Cendia posts require at least 3 (dollar amounts, percentages, time durations, or counts).`);
}

// ===== EVAL CRITERIA (warnings, not failures) =====
const wordCount = body.split(/\s+/).length;
if (wordCount < 1000) warnings.push(`Word count ${wordCount} is below 1000 floor.`);
if (wordCount > 2000) warnings.push(`Word count ${wordCount} is above 2000 ceiling for advisory content.`);

const h2Count = (body.match(/^## /gm) || []).length;
if (h2Count < 4) warnings.push(`Only ${h2Count} H2 sections. Most strong posts have 5-8.`);
if (h2Count > 10) warnings.push(`${h2Count} H2 sections, likely over-segmented.`);

const pullquoteCount = (body.match(/<blockquote class="pullquote">/g) || []).length;
if (pullquoteCount > 1) warnings.push(`${pullquoteCount} pull quotes. Style guide allows max 1.`);

const tableCount = (body.match(/^\|.*\|$/gm) || []).length;
if (tableCount === 0 && pullquoteCount === 0) {
  warnings.push('No table and no pull quote. Post may read as a wall of text.');
}

// Surface-vs-structure framing eval
if (!/surface|symptom|structural|underlying cause|root cause/i.test(body)) {
  warnings.push('No surface-vs-structure framing detected. Cendia posts strongly benefit from naming the symptom and the cause separately.');
}

// GEO eval: H2 direct answer check
const h2Sections = body.split(/^## /m).slice(1);
let h2WithoutDirectAnswer = 0;
for (const section of h2Sections) {
  const heading = section.split('\n')[0];
  if (/^(FAQ|Frequently Asked Questions)\s*$/i.test(heading)) continue;
  const firstLines = section.split('\n').slice(1).filter(l =>
    l.trim() && !l.startsWith('#') && !l.startsWith('|') && !l.startsWith('<') &&
    !l.startsWith('-') && !l.startsWith('*') && !/^\d+\./.test(l)
  ).slice(0, 1);
  if (firstLines.length === 0) continue;
  if (firstLines[0].trim().length > 280) h2WithoutDirectAnswer++;
}
if (h2WithoutDirectAnswer > Math.floor(h2Sections.length / 2)) {
  warnings.push(`${h2WithoutDirectAnswer}/${h2Sections.length} H2 sections do not lead with a direct answer. GEO best practice is to answer the implied question in 1-2 sentences before adding context.`);
}

// FAQ presence
if (!/^##\s+(FAQ|Frequently Asked Questions)/m.test(body)) {
  warnings.push('No FAQ section detected. Optional, but FAQ sections generate FAQPage schema which is heavily cited by AI search.');
}

// ===== REPORT =====
console.log(`\nLint report: ${postPath}`);
console.log(`  Word count: ${wordCount}`);
console.log(`  H2 sections: ${h2Count}`);
console.log(`  Specific numbers found: ${numbersFound}`);
console.log(`  Frameworks referenced: ${referencedFrameworks.length} (${referencedFrameworks.join(', ') || 'none'})`);

if (warnings.length) {
  console.log(`\n  WARNINGS (${warnings.length}):`);
  for (const w of warnings) console.log(`    - ${w}`);
}

if (failures.length) {
  console.log(`\n  FAILURES (${failures.length}):`);
  for (const f of failures) console.log(`    - ${f}`);
  console.log('\nRESULT: FAIL — post drops to _drafts/ for review.\n');
  process.exit(1);
}

console.log('\nRESULT: PASS — post is publishable.\n');
process.exit(0);
