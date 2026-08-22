# Code-Tantrum 😤

A browser extension that hides CodeTantra's SensAI assistant popups — the **"Are you stuck?"** idle nag, the auto-opening chat panel, the MCQ helper toolbar, and the floating mascot.

All of it, gone.

No more losing focus mid-problem because a cartoon sun wants to check in on you.

## What It Blocks 🌞

* 🌞 **Floating mascot widget** — any mood: happy, sad, sleepy, excited
* 💬 **"Are you stuck? You've been idle for a while"** nag popup
* 🪟 **"Assisting..." SensAI chat panel** — auto-opens on submit / next question
* 🧰 **MCQ helper toolbar** — Simplify / Elaborate / Hint / 50-50 / Clear
* 🛠️ **Vertical toolbar** — Summarize / Explain / Visualize / Concepts / Resources / Highlights

## Features

* **One toggle** to turn blocking on/off entirely
* **Theme sync** — automatically matches CodeTantra's dark/light mode, or set it manually
* **Runs entirely locally** — no data collection, external requests, or tracking

## Installation

One version of the extension works across **Chrome, Edge, Brave, and Firefox** — no need to pick a browser-specific download.

1. Download this repo using **Code → Download ZIP**.
2. Follow the steps for your browser below.

**Chrome / Edge / Brave**
- Open `edge://extensions` or `chrome://extensions`
- Turn on **Developer mode** — usually in the top-right
- Click **Load unpacked**
- Select the unzipped folder
- Pin the extension and you're done.

**Firefox**
- Open `about:debugging#/runtime/this-firefox`
- Click **Load Temporary Add-on**
- Select the `manifest.json` file inside the unzipped folder

> **Note:** Firefox temporary add-ons are unloaded when you restart the browser. For a permanent installation, the extension needs to be signed through Mozilla's Add-on site, or you can set `xpinstall.signatures.required` to `false` in `about:config` (**advanced users only**).

## Usage

Click the extension icon in your toolbar to open the settings:

* **Block Tantrums** — master on/off switch
* **Theme** — Auto / Dark / Light for the popup's own appearance
* **Rescan page** — forces an immediate re-check of the current tab

## Why?

CodeTantra shipped a **"SensAI"** feature that pops up assistant nudges every time you switch questions, submit, or sit still for a bit.

Useful for some. Unwanted friction for others.

**This extension gives you the choice back.**

## Disclaimer

This is an **unofficial, independent project** and isn't affiliated with or endorsed by CodeTantra.

It only hides UI elements on the page (via CSS). It **doesn't modify your submissions, grades, or any server-side behavior**.

Use at your own discretion and in line with your institution's policies.

---

Thank you :)
<img width="125" height="125" alt="ChatGPT Image Aug 22, 2026, 12_35_20 PM" src="https://github.com/user-attachments/assets/6675837d-bfc2-48fe-af5c-be2e8315707b" />
