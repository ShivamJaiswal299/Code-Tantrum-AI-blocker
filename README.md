<img width="1254" height="1254" alt="ChatGPT Image Aug 22, 2026, 12_35_20 PM" src="https://github.com/user-attachments/assets/6675837d-bfc2-48fe-af5c-be2e8315707b" />
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

### Chrome / Edge / Brave

1. Download this repo using **Code → Download ZIP** and unzip it, or clone it with Git.
2. Open `edge://extensions` or `chrome://extensions`
3. Turn on **Developer mode** — usually in the top-right
4. Click **Load unpacked**
5. Select the unzipped `chromium/` folder
6. Pin the extension and you're done.

### Firefox

1. Download and unzip this repo as above.
2. Open `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on**
4. Select the `manifest.json` file inside the `firefox/` folder

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
