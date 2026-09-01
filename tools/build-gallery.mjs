// ---------------------------------------------------------------------------
// Builds the gallery + social manifests and every derivative the site serves.
//
//   node tools/build-gallery.mjs            # incremental
//   node tools/build-gallery.mjs --force    # re-encode everything
//
// Sources are the working masters on the SSD; nothing here writes to them.
// ---------------------------------------------------------------------------
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { createCanvas } from '@napi-rs/canvas';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { SOURCE, DISCIPLINES, PROJECTS, SOCIAL_SOURCE, SOCIAL_LINES } from './gallery.config.mjs';

const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SRC = path.resolve(HERE, SOURCE);
const OUT = path.join(ROOT, 'assets', 'gallery');
const SOCIAL_OUT = path.join(ROOT, 'assets', 'social');
const FORCE = process.argv.includes('--force');

const THUMB_W = 520;   // grid tile — 2x a ~260px slot
const FULL_W = 1600;   // lightbox
const COVER_W = 720;   // project / album cover

const IMAGE_EXT = /\.(png|jpe?g|webp|tiff?)$/i;
const VIDEO_EXT = /\.(mp4|mov|m4v)$/i;
const PDF_EXT = /\.pdf$/i;

let encoded = 0, skipped = 0;

// --- helpers ---------------------------------------------------------------

const mkdir = d => fs.mkdirSync(d, { recursive: true });

function walk(dir, base = dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full, base));
    else out.push(path.relative(base, full));
  }
  return out;
}

// Finder red tag = "latest and best". Read straight off the file system so the
// site follows whatever is tagged today, with no list to keep in sync.
function isRedTagged(absPath) {
  try {
    const hex = execFileSync('xattr', ['-px', 'com.apple.metadata:_kMDItemUserTags', absPath],
      { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
    return /Red/i.test(Buffer.from(hex.replace(/\s+/g, ''), 'hex').toString('latin1'));
  } catch { return false; }
}

// A tag on a folder covers everything inside it.
function buildTagIndex(rootAbs) {
  const tagged = new Set();
  const visit = dir => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith('.')) continue;
      const full = path.join(dir, e.name);
      if (isRedTagged(full)) tagged.add(path.relative(rootAbs, full));
      if (e.isDirectory()) visit(full);
    }
  };
  visit(rootAbs);
  return rel => {
    let p = rel;
    while (p && p !== '.') {
      if (tagged.has(p)) return true;
      const next = path.dirname(p);
      if (next === p) break;
      p = next;
    }
    return false;
  };
}

function fresh(src, dest) {
  if (FORCE || !fs.existsSync(dest)) return false;
  try { return fs.statSync(dest).mtimeMs >= fs.statSync(src).mtimeMs; } catch { return false; }
}

async function encode(input, dest, width, quality) {
  if (typeof input === 'string' && fresh(input, dest)) { skipped++; return readSize(dest); }
  mkdir(path.dirname(dest));
  const info = await sharp(input, { limitInputPixels: 0 })
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 5 })
    .toFile(dest);
  encoded++;
  return { w: info.width, h: info.height };
}

function readSize(file) {
  try {
    const m = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file],
      { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
    return { w: +/pixelWidth: (\d+)/.exec(m)[1], h: +/pixelHeight: (\d+)/.exec(m)[1] };
  } catch { return { w: 0, h: 0 }; }
}

// Derivatives are addressed by content id, so anything the fresh manifest does
// not reference is a leftover from an earlier structure. Left in place it ships
// as dead weight and shows up in git as phantom churn.
function prune(dir, keep) {
  if (!fs.existsSync(dir)) return 0;
  let removed = 0;
  for (const sub of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!sub.isDirectory()) continue;
    const subDir = path.join(dir, sub.name);
    for (const f of fs.readdirSync(subDir)) {
      const rel = `${path.basename(dir)}/${sub.name}/${f}`;
      if (!keep.has(rel)) { fs.unlinkSync(path.join(subDir, f)); removed++; }
    }
  }
  return removed;
}

// --- PDF -------------------------------------------------------------------

async function pdfPages(absPath) {
  const data = new Uint8Array(fs.readFileSync(absPath));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true, isEvalSupported: false }).promise;
  const pages = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const vp = page.getViewport({ scale: Math.min(FULL_W / base.width, 3) });
    const canvas = createCanvas(Math.ceil(vp.width), Math.ceil(vp.height));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
    pages.push(canvas.toBuffer('image/png'));
    page.cleanup();
  }
  await doc.destroy();
  return pages;
}

// --- video -----------------------------------------------------------------

function transcode(absSrc, destMp4, destPoster) {
  if (!fresh(absSrc, destMp4)) {
    mkdir(path.dirname(destMp4));
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', absSrc,
      '-vf', "scale='min(1080,iw)':-2:flags=lanczos",
      '-c:v', 'libx264', '-profile:v', 'high', '-crf', '30', '-preset', 'slow',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
      '-c:a', 'aac', '-b:a', '96k', '-ac', '2', destMp4]);
    encoded++;
  } else skipped++;
  if (!fresh(absSrc, destPoster)) {
    mkdir(path.dirname(destPoster));
    const tmp = destPoster.replace(/\.webp$/, '.tmp.png');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '0.5', '-i', absSrc,
      '-frames:v', '1', tmp]);
    return { tmp };
  }
  return {};
}

// --- naming ----------------------------------------------------------------

const natural = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

function prettyLabel(rel) {
  const base = path.basename(rel).replace(/\.[^.]+$/, '');
  return base
    .replace(/[_-]+/g, ' ')
    .replace(/\b(mockups?|creatives? for socials?|Free|Final|copy)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim() || base;
}

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------

async function buildGallery() {
  const isRed = buildTagIndex(SRC);
  const projects = [];

  for (const cfg of PROJECTS) {
    const projAbs = path.join(SRC, cfg.dir);
    if (!fs.existsSync(projAbs)) { console.warn('  ! missing', cfg.dir); continue; }

    let files = walk(projAbs)
      .filter(p => IMAGE_EXT.test(p) || VIDEO_EXT.test(p) || PDF_EXT.test(p))
      .filter(p => !cfg.skip || !cfg.skip(p))
      .filter(p => !cfg.only || cfg.only(p))
      .sort(natural.compare);

    // Same picture delivered twice (png + jpg): keep one.
    const seen = new Set();
    files = files.filter(p => {
      const key = p.replace(/\.[^.]+$/, '').toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const albums = cfg.albums.map(a => ({ ...a, files: [] }));
    const restAlbum = albums.find(a => a.rest);
    for (const f of files) {
      const hit = albums.find(a => a.match && a.match(f)) || restAlbum;
      if (hit) hit.files.push(f);
    }

    const outAlbums = [];
    for (const album of albums) {
      if (!album.files.length) continue;
      const items = [];

      for (const rel of album.files) {
        const abs = path.join(projAbs, rel);
        const red = isRed(path.join(cfg.dir, rel));
        const stem = `${cfg.id}-${album.id}-${items.length.toString().padStart(3, '0')}`;

        if (PDF_EXT.test(rel)) {
          const pages = await pdfPages(abs);
          for (let i = 0; i < pages.length; i++) {
            const id = `${cfg.id}-${album.id}-p${(i + 1).toString().padStart(2, '0')}`;
            const full = path.join(OUT, 'full', `${id}.webp`);
            const thumb = path.join(OUT, 'thumb', `${id}.webp`);
            if (FORCE || !fs.existsSync(full)) { await encode(pages[i], full, FULL_W, 82); }
            else skipped++;
            if (FORCE || !fs.existsSync(thumb)) { await encode(pages[i], thumb, THUMB_W, 74); }
            const size = readSize(full);
            items.push({
              id, type: 'image',
              thumb: `assets/gallery/thumb/${id}.webp`,
              full: `assets/gallery/full/${id}.webp`,
              w: size.w, h: size.h,
              label: `Page ${i + 1}`,
              featured: red
            });
          }
          continue;
        }

        if (VIDEO_EXT.test(rel)) {
          const id = stem;
          const mp4 = path.join(OUT, 'video', `${id}.mp4`);
          const poster = path.join(OUT, 'full', `${id}.webp`);
          const thumb = path.join(OUT, 'thumb', `${id}.webp`);
          const { tmp } = transcode(abs, mp4, poster);
          if (tmp) {
            await encode(tmp, poster, FULL_W, 82);
            await encode(tmp, thumb, THUMB_W, 74);
            fs.unlinkSync(tmp);
          } else skipped++;
          const size = readSize(poster);
          items.push({
            id, type: 'video',
            src: `assets/gallery/video/${id}.mp4`,
            thumb: `assets/gallery/thumb/${id}.webp`,
            full: `assets/gallery/full/${id}.webp`,
            w: size.w, h: size.h,
            label: prettyLabel(rel),
            featured: red
          });
          continue;
        }

        const id = stem;
        const full = path.join(OUT, 'full', `${id}.webp`);
        const thumb = path.join(OUT, 'thumb', `${id}.webp`);
        const size = await encode(abs, full, FULL_W, 82);
        await encode(abs, thumb, THUMB_W, 74);
        items.push({
          id, type: 'image',
          thumb: `assets/gallery/thumb/${id}.webp`,
          full: `assets/gallery/full/${id}.webp`,
          w: size.w, h: size.h,
          label: prettyLabel(rel),
          featured: red
        });
      }

      if (!items.length) continue;
      outAlbums.push({
        id: `${cfg.id}-${album.id}`,
        title: album.title,
        count: items.length,
        featured: items.some(i => i.featured),
        cover: items[0].thumb,
        items
      });
    }

    if (!outAlbums.length) { console.warn('  ! empty', cfg.dir); continue; }

    // Featured albums lead — that is the whole point of the red tag.
    outAlbums.sort((a, b) => (b.featured - a.featured));

    const count = outAlbums.reduce((n, a) => n + a.count, 0);
    // Default cover is the first item of the leading album; `cover` in the
    // config overrides it where that item is a title page or a weak opener.
    let coverItem = (outAlbums.find(a => a.featured) || outAlbums[0]).items[0];
    if (cfg.cover) {
      const src = outAlbums.find(a => a.id === `${cfg.id}-${cfg.cover.album}`);
      if (src && src.items[cfg.cover.index]) coverItem = src.items[cfg.cover.index];
      else console.warn(`  ! cover override missed for ${cfg.id}`);
    }
    // Named after the item it came from, so re-picking a cover writes a new
    // file and the prune step drops the old one instead of silently caching.
    const coverId = coverItem.id;
    await encode(path.join(OUT, 'full', `${coverId}.webp`), path.join(OUT, 'cover', `${coverId}.webp`), COVER_W, 80);

    projects.push({
      id: cfg.id,
      name: cfg.name,
      tagline: cfg.tagline,
      disciplines: cfg.disciplines,
      year: cfg.year,
      role: cfg.role,
      link: cfg.link || null,
      featured: outAlbums.some(a => a.featured),
      cover: `assets/gallery/cover/${coverId}.webp`,
      count,
      albums: outAlbums
    });
    console.log(`  ${cfg.name.padEnd(16)} ${String(count).padStart(3)} items · ${outAlbums.length} albums${projects.at(-1).featured ? ' · ★' : ''}`);
  }

  // Featured projects first, then the rest in config order.
  projects.sort((a, b) => (b.featured - a.featured));

  const manifest = {
    generated: new Date().toISOString(),
    disciplines: DISCIPLINES,
    total: projects.reduce((n, p) => n + p.count, 0),
    projects
  };
  mkdir(OUT);
  fs.writeFileSync(path.join(OUT, 'gallery.json'), JSON.stringify(manifest));

  const keep = new Set();
  for (const p of projects) {
    keep.add(p.cover.replace('assets/', ''));
    for (const a of p.albums) for (const i of a.items) {
      keep.add(i.thumb.replace('assets/', ''));
      keep.add(i.full.replace('assets/', ''));
      if (i.src) keep.add(i.src.replace('assets/', ''));
    }
  }
  const gone = prune(OUT, keep);
  if (gone) console.log(`  pruned ${gone} stale files`);
  return manifest;
}

// ---------------------------------------------------------------------------
// Social creatives
// ---------------------------------------------------------------------------

async function buildSocial() {
  const root = path.resolve(HERE, SOCIAL_SOURCE);
  const isRed = buildTagIndex(root);
  const albums = [];
  let n = 0;

  for (const line of SOCIAL_LINES) {
    const lineAbs = path.join(root, line.dir);
    if (!fs.existsSync(lineAbs)) continue;

    // Each immediate subfolder is one carousel; loose files at the top of a
    // line folder are single posts. "individual banners" is a bag of one-offs.
    const entries = fs.readdirSync(lineAbs, { withFileTypes: true })
      .filter(e => !e.name.startsWith('.'))
      .filter(e => line.dir !== '.' || !SOCIAL_LINES.some(l => l.dir === e.name));

    const groups = [];
    const loose = [];
    for (const e of entries) {
      if (e.isDirectory()) {
        const files = walk(path.join(lineAbs, e.name))
          .filter(f => IMAGE_EXT.test(f) || VIDEO_EXT.test(f))
          .sort(natural.compare);
        if (!files.length) continue;
        if (/individual banners/i.test(e.name)) {
          files.forEach(f => loose.push({ rel: path.join(e.name, f) }));
        } else {
          groups.push({ name: e.name, files: files.map(f => path.join(e.name, f)) });
        }
      } else if (IMAGE_EXT.test(e.name) || VIDEO_EXT.test(e.name)) {
        loose.push({ rel: e.name });
      }
    }

    groups.sort((a, b) => natural.compare(a.name, b.name));

    const emit = async (files, title) => {
      const id = 'a' + String(n++).padStart(3, '0');
      const items = [], thumbs = [];
      let featured = false, cover = null;

      for (let i = 0; i < files.length; i++) {
        const rel = files[i];
        const abs = path.join(lineAbs, rel);
        if (isRed(path.relative(root, abs))) featured = true;
        const iid = `${id}_${String(i).padStart(2, '0')}`;
        if (VIDEO_EXT.test(rel)) {
          const mp4 = path.join(SOCIAL_OUT, 'video', `${iid}.mp4`);
          const poster = path.join(SOCIAL_OUT, 'full', `${iid}.webp`);
          const thumb = path.join(SOCIAL_OUT, 'thumb', `${iid}.webp`);
          const { tmp } = transcode(abs, mp4, poster);
          if (tmp) { await encode(tmp, poster, 1400, 82); await encode(tmp, thumb, 400, 72); fs.unlinkSync(tmp); }
          else skipped++;
          items.push({ type: 'video', src: `assets/social/video/${iid}.mp4`, full: `assets/social/full/${iid}.webp` });
        } else {
          await encode(abs, path.join(SOCIAL_OUT, 'full', `${iid}.webp`), 1400, 82);
          await encode(abs, path.join(SOCIAL_OUT, 'thumb', `${iid}.webp`), 400, 72);
          items.push({ type: 'image', full: `assets/social/full/${iid}.webp` });
        }
        thumbs.push(`assets/social/thumb/${iid}.webp`);
        if (!cover) cover = abs;
      }

      await encode(cover, path.join(SOCIAL_OUT, 'cover', `${id}.webp`), 640, 78);
      albums.push({
        id, title, brand: 'Ecowell', line: line.line, kind: line.blurb,
        featured, cover: `assets/social/cover/${id}.webp`,
        count: items.length, items, thumbs
      });
    };

    for (let i = 0; i < groups.length; i++) {
      await emit(groups[i].files, `${line.line} · Carousel ${i + 1}`);
    }
    // One-off posts read better as a single album than as N one-post albums.
    if (loose.length) await emit(loose.map(l => l.rel), `${line.line} · Single Posts`);
  }

  albums.sort((a, b) => (b.featured - a.featured));
  mkdir(SOCIAL_OUT);
  fs.writeFileSync(path.join(SOCIAL_OUT, 'manifest.json'), JSON.stringify(albums));

  const keep = new Set();
  for (const a of albums) {
    keep.add(a.cover.replace('assets/', ''));
    a.thumbs.forEach(t => keep.add(t.replace('assets/', '')));
    a.items.forEach(i => { keep.add(i.full.replace('assets/', '')); if (i.src) keep.add(i.src.replace('assets/', '')); });
  }
  const gone = prune(SOCIAL_OUT, keep);
  if (gone) console.log(`  pruned ${gone} stale files`);
  console.log(`  ${albums.length} albums · ${albums.reduce((n, a) => n + a.count, 0)} posts`);
  return albums;
}

// ---------------------------------------------------------------------------

console.log('Gallery');
const g = await buildGallery();
console.log('Social');
await buildSocial();
console.log(`\n${g.projects.length} projects · ${g.total} gallery items · ${encoded} encoded, ${skipped} cached`);
