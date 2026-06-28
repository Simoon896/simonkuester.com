---
title: "Building this site, and checking my own work"
date: 2026-06-27
summary: "How I built and deployed this site, the deploy steps that tripped me up, and the security findings I caught when I scanned my own work."
tags: ["cloudflare", "deployment", "security", "astro"]
draft: false
---

I do detection and response at work, so putting up my own site felt like a good excuse to deploy something properly and then check my own work the way I would anyone else's. Here's how the build went, the parts of deploying that tripped me up, and what I found when I scanned it.

## The build

The site is static. It's built with Astro and output to plain HTML, with barely any JavaScript reaching the browser. For a portfolio that's the right call. There's nothing running at runtime for someone to exploit, and nothing to patch later. It loads fast, too. The less code that runs on a visitor's machine, the less there is to go wrong.

## Deploying it, where it got annoying

I host it on Cloudflare. The repo is connected to GitHub, so pushing to main builds and deploys in about a minute, which feels like magic right up until it doesn't.

Two things tripped me up.

The first was the lockfile. I work on Windows, and an npm lockfile generated on Windows leaves out a few Linux-only packages the build needs. Cloudflare builds on Linux, so its install step kept failing on missing dependencies. The fix was to stop committing the lockfile at all, which lets Cloudflare run a normal install and pull the right packages for its own platform. Obvious in hindsight, not while reading the build log for the fifth time.

The second was DNS. I moved the domain over to Cloudflare, and the old parking records sat there blocking the real ones until I deleted them. Once the nameservers pointed the right way and the leftovers were gone, the custom domain attached cleanly.

## Checking my own work

Once it was live, I ran a security scan against it, the same way I would against anything else. It came back with nine findings, and a couple were genuinely embarrassing for someone who does this for a living.

The big one: my site was being served over plain HTTP. If you typed `http://` instead of `https://`, you got the site back over an unencrypted connection with no redirect. The certificate was there and HTTPS worked fine, but nothing forced you onto it. That's exactly the kind of thing I'd flag in a client's environment, and it was sitting on my own.

The fix was one setting to push every request onto HTTPS, plus HSTS, which tells browsers to refuse plain HTTP for the domain from then on. HSTS is worth handling carefully. It has a "preload" option that bakes your domain into browsers and is genuinely hard to undo, so I left that off until I'm sure and started with a shorter lifetime. I also added a `security.txt` file, a small standard file that tells a researcher how to reach me if they find a problem.

> The page itself is a small target. The account behind it is the real one.

That was the real takeaway. The site is static, with no database and no login for an attacker to go after. The thing actually worth protecting is the account that can change it. If someone got into my GitHub or my Cloudflare, they could redirect or deface the site in seconds, and no security header would stop them. So the most valuable item wasn't even on the scan: strong two-factor on the accounts that control the site.

## The boring stuff

None of this is advanced. It's the unglamorous work that's easy to skip on your own projects, because nobody's auditing them but you. That's exactly why I wanted to do it here and write it down. If you've got a personal site running on default settings, it's worth half an hour to scan it like it belongs to someone else.
