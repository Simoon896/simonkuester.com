---
title: "First post! The process of building my website"
date: 2026-06-27
summary: "How I built and deployed this site, the deploy step that tripped me up, and the security findings I caught when I scanned my own work."
tags: ["cloudflare", "deployment", "security", "astro"]
draft: false
---

Something I wanted to do recently is create a good looking personal website, so here it is! Here's how the build went, the parts of deploying that tripped me up, and what I found when I performed a security scan.

## The build

The site is static. It's built with Astro and output to plain HTML, with barely any JavaScript reaching the browser. There's nothing running at runtime for someone to exploit, and nothing to patch later. It loads fast, too. The less code that runs on a visitor's machine, the less there is to go wrong. Reducing the attack surface of an environment is never a bad idea!

## Deploying the site

I host it on Cloudflare. The repo is connected to GitHub, so pushing to main builds and deploys in about a minute, which feels like magic right up until it doesn't.

One thing tripped me up.

It was the lockfile. I work on Windows, and an npm lockfile generated on Windows leaves out a few Linux-only packages the build needs. Cloudflare builds on Linux, so its install step kept failing on missing dependencies. The fix was to stop committing the lockfile at all, which lets Cloudflare run a normal install and pull the right packages for its own platform. It was obvious in hindsight, but not while reading the build log for the fifth time.

## Checking my own work

Once it was live, I ran a security scan against it, the same way I would against anything else.

The big issue: my site was being served over plain HTTP. If you typed `http://` instead of `https://`, you got the site back over an unencrypted connection with no redirect. The certificate was there and HTTPS worked fine, but nothing forced you onto it. That's exactly the kind of thing I'd flag in a client's environment, and it was sitting on my own.

The fix was one setting to push every request onto HTTPS, plus HSTS, which tells browsers to refuse plain HTTP for the domain from then on. HSTS is worth handling carefully. I also added a `security.txt` file, a small standard file that tells a researcher how to reach me if they find a problem (let me know if you find anything!).

> The page itself is a small target. The account behind it is the real one.

That was the real takeaway. The site is static, with no database and no login for an attacker to go after. The thing actually worth protecting is the account that can change it. If someone got into my GitHub or my Cloudflare, they could redirect or deface the site in seconds, and no security header would stop them. So the most valuable item wasn't even on the scan, it was the account!

## The boring stuff

None of this is advanced. It's the unglamorous work that's easy to skip on your own projects, because nobody's auditing them but you. That's exactly why I wanted to do it here and write it down. If you've got a personal site running on default settings, it's worth half an hour to scan it like it belongs to someone else.
