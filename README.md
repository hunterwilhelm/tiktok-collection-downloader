# What is this?

This is a script that downloads videos organized by collection from a TikTok account.

# Example File Tree

```
tiktok-collection-downloader/
├── videos/
│   └── hunterswilhelm_-_Eclipse/
│       ├── mylifeassugar_ 1712602403 7355571214556974379.info.json
│       ├── mylifeassugar_ 1712602403 7355571214556974379.mp4
```

# How to run

1. Install: [bun](https://bun.sh)
1. Install: [curl](https://curl.se/)
1. Install: [yt-dlp](https://github.com/yt-dlp/yt-dlp)
1. Install: https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc
1. Log in to tiktok.com, export the cookies.
1. Save the `www.tiktok.com_cookies.txt` file to the `account-info` folder of this project

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.42. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
