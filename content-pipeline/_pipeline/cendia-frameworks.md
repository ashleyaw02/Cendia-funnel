# Cendia Frameworks Library

**Source:** Cendia Solutions methodology
**Status:** Active reference for blog drafting pipeline + lint
**Last verified:** 2026-05-07

## Purpose

This is Cendia's "moat content" — the named diagnostic models that anchor every blog post. The lint enforces that every post must reference at least ONE framework from this allowlist. New frameworks must be added here before being used in published content.

---

## Diagnostic Frameworks (for identifying problems)

### Three-Layer Compliance Model

Originally developed for HOADirect's regulatory context, this model generalizes to any operational obligation.

- **Layer 1 — The Trigger.** The artifact, document, or action the obligation requires.
- **Layer 2 — The Timing.** The deadline or window the obligation lives inside.
- **Layer 3 — The Proof.** The evidence trail that demonstrates the obligation was met.

Most operational failures happen at Layers 2 and 3, not Layer 1. Teams produce the artifact (Layer 1) but miss the deadline (Layer 2) or can't prove the work was done (Layer 3).

### Handoff Cost Model

Every workflow step where work moves between people, teams, or systems is a handoff. Each handoff has a measurable cost: the time it consumes, the error rate it introduces, the rework it triggers.

- **Internal handoffs:** within a single team
- **Boundary handoffs:** between teams (sales to ops, ops to finance, ops to delivery)
- **External handoffs:** to clients, vendors, or partners

Boundary handoffs cost roughly 4x more than internal handoffs because they involve translation between contexts. Cendia's typical finding: a 50-100 person services firm has 14-22 handoffs between a customer request and a delivered outcome, and 60-70% of margin leakage happens at boundary handoffs.

### 2-Minute Rule (Automation Triage)

Counterintuitive automation framing for early-stage operational improvement.

- If a task takes under 2 minutes AND happens 10+ times per week AND requires zero judgment: automate this month.
- If it requires judgment (even a little): document it before you automate it.
- If it takes more than 2 minutes per instance: map the workflow before touching automation.

The rule reframes automation away from "build the big system" toward "stack small wins." A 2-minute task done 10x/week compounds to 16+ hours/year per task.

### The Surface vs. Structure Lens

Most operational problems have a visible symptom and an invisible cause. The symptom is what the team escalates; the cause is what the symptom is downstream of.

- **Surface symptom:** what people complain about or escalate.
- **Structural cause:** the missing role, missing handoff, missing decision rule, or missing measurement that produces the symptom.

Treating symptoms produces temporary relief and recurring problems. Treating structure produces durable change.

### Eliminate-Before-Automate

Automation locks workflows in place. Before automating any process, ask whether the process should exist at all.

1. List every step in the workflow.
2. For each step, ask: has this step caught a real problem in the last 12 months?
3. Eliminate steps where the answer is no.
4. Automate what survives.

Cendia's typical finding: 40-60% of operational steps in services firms can be eliminated before any automation conversation begins.

---

## Measurement Frameworks (for quantifying problems)

### Cost-Per-Workflow

Operational workflows have three cost components:

- **Direct labor cost:** hours x loaded rate of the people doing the work
- **Coordination cost:** the time spent on handoffs, status updates, and re-explaining context
- **Failure cost:** the rework, refunds, and recovery time when the workflow breaks

Most teams measure direct labor only. Coordination cost is typically 30-50% of total workflow cost in services firms. Failure cost is typically the largest variable.

### The Margin Leak Map

A diagnostic exercise that maps where margin disappears between a quoted project and a delivered outcome.

- **Quote-to-Kickoff leak:** scope creep, contract delays, onboarding friction
- **Kickoff-to-Delivery leak:** unclear ownership, rework, missed handoffs
- **Delivery-to-Invoice leak:** delayed invoicing, disputed work, collection time
- **Invoice-to-Cash leak:** payment terms, dispute resolution, write-offs

A typical 60-person services firm leaks 8-15% of contracted revenue across these four boundaries. Most of it is recoverable through process changes, not pricing changes.

---

## Decision Frameworks (for choosing solutions)

### Build vs. Buy vs. Eliminate

For any operational gap, three options exist before "buy software":

- **Build:** create internal capacity (hire, train, document)
- **Buy:** acquire external capacity (vendor, contractor, software)
- **Eliminate:** remove the underlying need

Most operational problems get a "buy software" answer reflexively. Cendia's typical recommendation: eliminate first (40-60% of the time), build second, buy third.

### Fractional vs. Internal vs. Consulting

For operations leadership specifically, three structural options:

- **Fractional COO/Operator:** part-time external operator, ~$8-15K/month
- **Internal hire:** full-time Operations Director, $120-180K loaded
- **Consulting engagement:** project-based diagnostic and design work

Cendia positions explicitly: consulting is the right answer when the problem is diagnostic (you don't know what's broken) or design (you know what's broken but not how to fix it). Fractional is the right answer when the problem is execution (you know what to do but don't have the bandwidth). Internal is the right answer when the problem is durable and the firm is large enough (typically 75+ people).

---

## Outcome Frameworks (for sizing impact)

### 30/90/365 Sizing

Every Cendia recommendation is sized against three time horizons:

- **30-day impact:** what changes in the first 30 days post-engagement
- **90-day impact:** what changes by end of quarter
- **365-day impact:** what changes by year-end if the recommendation is implemented

This forces honest scope. "Strategic transformation" without 30-day impact is usually theater.

### The Three-to-One Rule

Cendia's internal threshold for recommending an operational change: it must produce at least 3x its implementation cost in the first 12 months. Below 3x, the change isn't worth the disruption it creates.

Used to filter Cendia's own recommendations and to evaluate other consultants' proposals.

---

## How to use this file

When drafting a post, the AI should:
1. Identify which framework(s) the topic naturally anchors to
2. Use the framework's exact named terminology (e.g., "the 2-Minute Rule," not "the two-minute test")
3. Reference at least one specific number from the framework's typical findings
4. If a post would benefit from a framework not in this list, draft against the closest existing framework or flag the need to add a new one

The lint script reads framework names from this file. If a post references "the 2-Minute Rule" and that name doesn't appear in this file, the lint fails.

## How to add a new framework

1. Add it to the relevant section above (Diagnostic, Measurement, Decision, or Outcome)
2. Define it with the same structure: a one-line description + the named components
3. Include at least one specific quantitative finding ("typical range," "60-70% of cases")
4. Commit and the next pipeline run will accept it
