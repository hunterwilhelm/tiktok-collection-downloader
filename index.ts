import { $ } from "bun";

if (!await Bun.file("account-info/www.tiktok.com_cookies.txt").exists()) {
  console.log("Use the chrome extension to: https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc")
  console.log("Download the cookies file from https://www.tiktok.com/ and save it as ./account-info/www.tiktok.com_cookies.txt");
  process.exit(1);
}

let username = await Bun.file("account-info/username.txt")
  .text()
  .catch(() => null);
if (!username) {
  username = prompt("Enter TikTok username");
  await Bun.write("account-info/username.txt", username);
}
const secUidText = await $`curl -b ./account-info/www.tiktok.com_cookies.txt "https://www.tiktok.com/@${username}?lang=en"`.text();

const secUid = secUidText.match(/"secUid":"([^"]+)"/)?.[1];
if (!secUid) {
  throw new Error("Could not find secUid");
}

const collectionList = await Bun.file("account-info/collections.json")
  .json()
  .catch(() => []);
if (collectionList.length === 0) {
  console.log("Fetching collections...");
  let cursor = "0";
  while (true) {
    console.log(">", cursor)
    const result = await $`curl -b ./account-info/www.tiktok.com_cookies.txt 'https://www.tiktok.com/api/user/collection_list/?aid=1988&count=30&cursor=${cursor}&secUid=${secUid}'`.json();
    if (!result.collectionList) {
      break;
    }
    const collectionsFormatted = result.collectionList.map((collection) => ({
      url: `https://www.tiktok.com/@${collection.userName}/collection/${encodeURIComponent(collection.name)}-${collection.collectionId}`,
      folderName: `${collection.userName} - ${collection.name}`,
      total: parseInt(collection.total)
    }));
    collectionList.push(...collectionsFormatted);
    if (result.cursor === `${result.total}`) {
      break;
    }
    cursor = result.cursor;
  }
  collectionList.sort((a, b) => a.total - b.total);
  await Bun.write(
    "account-info/collections.json",
    JSON.stringify(collectionList, null, 2)
  );
  console.log(`Found ${collectionList.length} collection(s)`);
} else {
  console.log(`Found ${collectionList.length} collection(s) from cache`);
}
for (const collection of collectionList) {
  const folder = `./videos/${sanitizeFilename(collection.folderName)}`;
  await $`yt-dlp --cookies "account-info/www.tiktok.com_cookies.txt" --referer "https://www.tiktok.com/" "${collection.url}" -o "${folder}/%(uploader)s %(timestamp)s %(id)s.%(ext)s" --write-info-json --download-archive "${folder}/archive.txt"`;
}

function sanitizeFilename(input: string): string {
  // Define a regex for invalid filename characters
  const invalidChars = /[\/\?<>\\:\*\|":]/g; // Commonly restricted characters in filenames
  const replacement = "_"; // Replace invalid characters with an underscore

  // Replace invalid characters and trim whitespace
  const safeString = input
    .replace(invalidChars, replacement) // Replace invalid characters
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .trim(); // Trim leading and trailing whitespace

  // Ensure the filename isn't empty and doesn't end with a dot
  return safeString ?? sanitizeFilename(new Date().toISOString());
}
