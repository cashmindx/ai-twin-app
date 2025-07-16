# AI Twin App

This is a web app that allows users to upload their face, type a message, and generate a talking AI video clone using the D-ID API.

## Features
- Upload face photo
- Type a message
- Generate talking video clone in 720p, 1080p, or 4K
- Tiered pricing with Yoco links
- Hosted on GitHub + Netlify

## Deployment
Push this to GitHub and connect to Netlify. Make sure your `.env` or function securely contains your D-ID API key.

## Folder Structure
```
.
├── assets/
│   ├── logo.png
│   ├── placeholder.png
│   └── welcome.mp4
├── netlify/
│   └── functions/
│       └── generate-video.js
├── index.html
├── styles.css
├── netlify.toml
└── README.md
```
