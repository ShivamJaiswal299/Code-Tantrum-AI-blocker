Code-Tantrum 😤

A browser extension that hides CodeTantra's SensAI assistant popups — the "Are you stuck?" idle nag, the auto-opening chat panel, the MCQ helper toolbar, and the floating mascot. All of it, gone.

No more losing focus mid-problem because a cartoon sun wants to check in on you.

What it blocks
🌞 The floating mascot widget (any mood — happy, sad, sleepy, excited)
💬 "Are you stuck? You've been idle for a while" nag popup
🪟 The full "Assisting <name>" SensAI chat panel (auto-opens on submit / next question)
🧰 The Simplify / Elaborate / Hint / 50-50 / Clear toolbar on MCQs
🛠️ The vertical Summarize / Explain / Visualize / Concepts / Resources / Highlights strip
Features
One toggle to turn blocking on/off entirely
Theme sync — matches CodeTantra's dark/light mode automatically, or set it manually
Runs entirely locally. No data collection, no external requests, no tracking.
Install
Chrome / Edge / Brave
Download this repo (Code → Download ZIP) and unzip it, or git clone it
Open edge://extensions (or chrome://extensions)
Turn on Developer mode (toggle, usually top-right)
Click Load unpacked
Select the unzipped chromium/ folder
Pin the extension and you're done
Firefox
Download and unzip this repo as above
Open about:debugging#/runtime/this-firefox
Click Load Temporary Add-on
Select the manifest.json file inside the firefox/ folder

Note: Firefox temporary add-ons unload when you restart the browser. For a permanent install, the extension needs to be signed via Mozilla's Add-on site, or you can set xpinstall.signatures.required to false in about:config (advanced users only).

Usage

Click the extension icon in your toolbar to open settings:

Block Tantrums — master on/off switch
Theme — Auto / Dark / Light for the popup's own appearance
Rescan page — forces an immediate re-check of the current tab

Why

CodeTantra shipped a "SensAI" feature that pops up assistant nudges every time you switch questions, submit, or sit still for a bit. Useful for some, unwanted friction for others. This extension gives you the choice back.

Disclaimer

This is an unofficial, independent project and isn't affiliated with or endorsed by CodeTantra. It only hides UI elements on the page (via CSS) — it doesn't modify your submissions, grades, or any server-side behavior. Use at your own discretion and in line with your institution's policies.

Thank you :)
