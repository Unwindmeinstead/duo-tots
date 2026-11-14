/**
 * Processes the raw generated game art in assets-src/ into the
 * web-ready assets the Play Zone physics games use:
 *   - chroma-keyed sprites (green / magenta screen → alpha WebP)
 *   - photo textures + the bowling lane plate (plain WebP)
 * Run: node scripts/process-game-assets.mjs   (sharp is a Next dep)
 */
import sharp from "sharp";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "assets-src");
const OUT = join(ROOT, "public", "images", "play");

const SPRITES = [
  { file: "media-generation-sprite-car-green-0-84f76937-0de4-4d36-8fd7-16a4a9aa44ff.png", out: "sprite-car.webp", key: [0, 255, 0], width: 760 },
  { file: "media-generation-sprite-bike-green-0-931302e5-f70c-4036-a32d-5364494f91e4.png", out: "sprite-bike.webp", key: [0, 255, 0], width: 760 },
  { file: "media-generation-sprite-rocket-green-0-2e614e54-5423-40e0-86e2-622f1293b45f.png", out: "sprite-rocket.webp", key: [0, 255, 0], width: 420 },
  { file: "media-generation-sprite-plane-green-0-55c4d1ba-51b2-4c48-8169-44fa75cadf42.png", out: "sprite-plane.webp", key: [0, 255, 0], width: 760 },
  { file: "media-generation-sprite-bowling-ball-green-0-bbd78b7b-24a7-42b4-901f-790a6332e843.png", out: "sprite-bowling-ball.webp", key: [0, 255, 0], width: 380 },
  { file: "media-generation-sprite-bowling-pin-green-0-d87ddb60-fb1b-4a10-8c5f-f351ee2fe792.png", out: "sprite-bowling-pin.webp", key: [0, 255, 0], width: 300 },
  { file: "media-generation-sprite-cloud-green-0-e873adef-bfb2-4ec2-b1e6-00069ad58f1e.png", out: "sprite-cloud.webp", key: [0, 255, 0], width: 520 },
  { file: "media-generation-sprite-tree-magenta-0-c17dd7df-6467-4946-be5b-4215bd1fe996.png", out: "sprite-tree.webp", key: [255, 0, 255], width: 520 },
  { file: "media-generation-sprite-house-magenta-0-95521d26-5ce7-4660-9a59-c84ab06fc136.png", out: "sprite-house.webp", key: [255, 0, 255], width: 520 },
];

const PLATES = [
  { file: "media-generation-texture-grass-0-a939b186-b397-4f0e-9eb3-dcbcf3f5d487.jpg", out: "tex-grass.webp", size: 512 },
  { file: "media-generation-texture-dirt-road-0-aaf331e6-d0b7-4404-a3f3-c6efcb870235.jpg", out: "tex-dirt.webp", size: 512 },
  { file: "media-generation-texture-wood-0-bab72d28-2ee0-4e88-93e0-c014456131f0.jpg", out: "tex-wood.webp", size: 512 },
  { file: "media-generation-scene-bowling-lane-0-4e565954-79ee-4042-9074-91d0e3a5ecef.jpg", out: "bowling-lane.webp", size: 880 },
];

/** Key out the screen colour: alpha ramps with colour distance,
    and the dominant key channel is pulled down (despill) so edges
    don't glow green/pink against the game scenes. */
async function keySprite({ file, out, key, width }) {
  const img = sharp(join(SRC, file)).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const [kr, kg, kb] = key;
  const px = new Uint8ClampedArray(data);
  let minX = info.width, minY = info.height, maxX = -1, maxY = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 4;
      const r = px[i], g = px[i + 1], b = px[i + 2];
      const dist = Math.hypot(r - kr, g - kg, b - kb);
      // 40 → fully transparent, 130 → fully opaque (soft 90-wide edge)
      let a = Math.round(((dist - 40) / 90) * 255);
      a = Math.max(0, Math.min(255, a));
      px[i + 3] = a;
      if (a > 12) {
        // despill: cap the key channel at the stronger of the other two
        if (key[1] === 255 && g > Math.max(r, b)) px[i + 1] = Math.max(r, b);
        if (key[0] === 255 && key[2] === 255) {
          const m = Math.max(r, b);
          if (r > g) px[i] = m;
          if (b > g) px[i + 2] = m;
        }
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) throw new Error(`no foreground found in ${file}`);
  const pad = 6;
  const left = Math.max(0, minX - pad), top = Math.max(0, minY - pad);
  const w = Math.min(info.width, maxX + pad + 1) - left;
  const h = Math.min(info.height, maxY + pad + 1) - top;
  await sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } })
    .extract({ left, top, width: w, height: h })
    .resize({ width: Math.min(width, w) })
    .webp({ quality: 86 })
    .toFile(join(OUT, out));
  console.log(`sprite ${out}: ${w}x${h} -> width ${Math.min(width, w)}`);
}

async function plate({ file, out, size }) {
  await sharp(join(SRC, file))
    .resize({ width: size, height: size, fit: "cover" })
    .webp({ quality: 82 })
    .toFile(join(OUT, out));
  console.log(`plate ${out}: ${size}x${size}`);
}

for (const s of SPRITES) await keySprite(s);
for (const p of PLATES) await plate(p);
console.log("done");
