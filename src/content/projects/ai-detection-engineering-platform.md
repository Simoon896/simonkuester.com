---
title: AI-Driven Detection Engineering Platform
period: '2026'
tools:
  - Python
  - MCP / FastMCP
  - Wazuh
  - Atomic Red Team
summary: Detection-engineering tools for a Wazuh MCP server that let an AI agent author rules, validate them live, and cut false positives ~90%.
links:
  - label: Repo
    url: https://github.com/Simoon896/ai-detection-engineering-platform
coverImage: /uploads/project-1.png
featured: true
order: 1
---

## Challenge

Tuning a SIEM is slow, manual work. When a detection rule gets too noisy, someone has to dig through the alerts, find the rule, edit its XML, test it, restart the manager, and confirm the false positives stopped without breaking any real detections. It's a tight loop that eats analyst time and spreads across a few different tools.

## Contribution

I extended an open-source Wazuh MCP server so an AI agent could run that loop with me in plain language. The upstream server could already query alerts and trigger active response, so I added the detection-engineering side: seven tools that let the agent read and edit rule and decoder files, run them through Wazuh's logtest, and apply the changes. From inside Cursor I could say "this rule is noisy, scope it down but keep the true positives," then watch it draft the rule, validate it live, and confirm the fix. I also wired in an Atomic Red Team workflow that fires real attack techniques in an isolated Windows lab, so I can check the detections still catch what they're supposed to.

## Key decisions

The tools that change anything, like editing a rule or restarting the manager, are gated behind my approval on every call. The agent reads and validates freely, but it can't touch a rule or restart the SIEM without a yes from me. I treated all alert and log content as untrusted, since an attacker can plant text meant to manipulate the AI, and I ran the whole thing through a least-privilege Wazuh account pointed at a test manager, never production. That RBAC scope is the real safety boundary, not the agent's settings.

## Outcome

What came out of it is a working detection-engineering assistant. Tuning that used to be a string of manual steps now happens in a conversation, checked against true-positive samples before anything ships. On a Windows baseline I used it to cut high and critical false positives by about 90% without losing real detections, and the gated, test-only design kept it safe to point at a live SIEM. It was really fun and interesting to build out, so check it out!
