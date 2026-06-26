---
title: "Pre-commit secrets scanner"
role: "Author and maintainer"
period: "2023"
tools: ["Go", "Git hooks"]
summary: "A fast pre-commit hook that keeps credentials out of source control."
links:
  - label: "Repo"
    url: "https://github.com/Simoon896"
featured: true
order: 2
---

## Challenge
Credentials kept landing in commits and getting caught too late, in review.

## Contribution
Wrote a fast Go pre-commit hook that scans staged diffs for high-entropy strings
and known token formats.

## Key decisions
Optimized for sub-200ms runs so developers wouldn't disable it; tuned signatures
to keep false positives low.

## Outcome
Zero secrets reached the default branch in the year after rollout.
