// ---------------------------------------------------------------------------
// Gallery source-of-truth.
//
// Everything the visitor sees comes from `My works/Gallery`. This file only
// says how those folders map onto the site's information architecture: which
// project a folder belongs to, how its files split into albums, and the copy
// that goes around them. Red Finder tags on the source folders/files decide
// what is "latest & best" — that is read at build time, never hardcoded here.
// ---------------------------------------------------------------------------

export const SOURCE = '../../My works/Gallery';

// Cross-cutting filters shown as chips above the grid.
export const DISCIPLINES = [
  { id: 'identity',  label: 'Brand & Identity' },
  { id: 'packaging', label: 'Packaging & Labels' },
  { id: 'print',     label: 'Print & Brochure' },
  { id: 'product',   label: 'Product & UI' }
];

// Album `match` is evaluated against the file's path relative to the project
// folder. First matching album wins, so order matters. `rest: true` collects
// whatever no earlier album claimed.
export const PROJECTS = [
  {
    id: 'loffia',
    dir: "L'OFFIA",
    name: "L'OFFIA",
    tagline: 'Skincare packaging and label design — full product range with studio mockups.',
    disciplines: ['packaging', 'identity'],
    year: '2025–26',
    role: 'Brand & Packaging Design',
    albums: [
      { id: 'latest',  title: 'Latest Work',      match: p => p.startsWith('latest/') },
      { id: 'ecova',   title: 'Ecova Label Range', match: p => p.startsWith('Ecova label new/') },
      { id: 'mockups', title: 'Product Mockups',  rest: true }
    ]
  },
  {
    id: 'haatak',
    dir: 'Haatak',
    name: 'Haatak',
    tagline: 'Fintech identity — logo system, iconmark and the guidelines that hold it together.',
    disciplines: ['identity'],
    year: '2025',
    role: 'Brand Identity',
    cover: { album: 'mockups', index: 4 },
    albums: [
      // Three short PDFs that are one document in practice.
      { id: 'guidelines', title: 'Brand Guidelines', match: p => /\.pdf$/i.test(p) },
      { id: 'logo',       title: 'Logo System',      match: p => /^Haatak logo file\/Digital\/.*\/PNG\//.test(p) },
      { id: 'mockups',    title: 'Brand Mockups',    rest: true }
    ],
    // The delivery package repeats every lockup across JPG/PDF/SVG/PNG,
    // Digital/Print, and with/without background. On screen the transparent
    // exports are indistinguishable from the white ones, so one PNG set on
    // background says the same thing without 100 near-clones.
    skip: p => /^Haatak logo file\/(Print\/|Digital\/.*\/(JPG|PDF|SVG)\/|Digital\/.*\/Without background)/.test(p)
  },
  {
    id: 'ecolixir',
    dir: 'ecolixir',
    name: 'Ecolixir',
    tagline: 'Wellness brand identity — mark, palette and applications, documented end to end.',
    disciplines: ['identity'],
    year: '2025',
    role: 'Brand Identity',
    albums: [
      { id: 'guidelines', title: 'Brand Guidelines', match: p => /\.pdf$/i.test(p) },
      { id: 'mockups',    title: 'Logo Mockups',     rest: true }
    ]
  },
  {
    id: 'dyer',
    dir: 'Dyer',
    name: 'Dyer',
    tagline: 'Hair-care identity built around a single confident wordmark.',
    disciplines: ['identity', 'packaging'],
    year: '2025',
    role: 'Brand Identity',
    cover: { album: 'mockups', index: 0 },
    albums: [
      { id: 'guidelines', title: 'Brand Guidelines', match: p => /\.pdf$/i.test(p) },
      { id: 'mockups',    title: 'Product Mockup',   rest: true }
    ]
  },
  {
    id: 'ecowell',
    dir: 'Ecowell creatives',
    name: 'Ecowell',
    tagline: 'Nutraceutical house brand — the printed brochure behind seven product lines.',
    disciplines: ['print', 'identity'],
    year: '2024–26',
    role: 'Design Lead',
    // The social output lives in its own window; here we keep the print work.
    only: p => /^Brochure(?: old)?\.pdf$/i.test(p),
    albums: [
      { id: 'brochure',  title: 'Brand Brochure',   match: p => /^Brochure\.pdf$/i.test(p) },
      { id: 'brochure-v1', title: 'Brochure — First Edition', rest: true }
    ],
    link: { label: 'Read the case study', href: 'ecowell-case-study-web/' }
  },
  {
    id: 'aifalcon',
    dir: 'aifalcon',
    name: 'AiFalcon',
    tagline: 'AI product brand — logo applications plus the dashboard and app it lives in.',
    disciplines: ['identity', 'product'],
    year: '2023–24',
    role: 'Brand & Product Design',
    cover: { album: 'mockups', index: 7 },
    albums: [
      { id: 'mockups',   title: 'Logo Mockups',   match: p => p.startsWith('Mockups/') },
      { id: 'dashboard', title: 'Product UI',     match: p => /Daashboard\.png$/i.test(p) },
      { id: 'demos',     title: 'App Walkthroughs', rest: true }
    ]
  },
  {
    id: 'behandsome',
    dir: 'be handsome',
    name: 'Be Handsome',
    tagline: "Men's grooming range — tubes, bottles and airless pumps, mocked up and shot.",
    disciplines: ['packaging'],
    year: '2025',
    role: 'Packaging Design',
    albums: [
      { id: 'shots',   title: 'Product Shots',      match: p => /^(WhatsApp Image|Screenshot)/i.test(p) },
      { id: 'mockups', title: 'Packaging Mockups',  rest: true }
    ]
  },
  {
    id: 'fargo',
    dir: 'FARGO',
    name: 'Fargo',
    tagline: 'Fashion campaign — poster series, launch banners and motion cuts.',
    disciplines: ['print'],
    year: '2024',
    role: 'Art Direction',
    albums: [
      { id: 'posters', title: 'Poster Series',   match: p => p.startsWith('1/') },
      { id: 'motion',  title: 'Motion',          match: p => /\.mp4$/i.test(p) },
      { id: 'banners', title: 'Campaign Banners', rest: true }
    ]
  },
  {
    id: 'ecova',
    dir: 'Ecova',
    name: 'Ecova Farms',
    tagline: 'Agri-brand collateral — company profile and product brochure.',
    disciplines: ['print'],
    year: '2024',
    role: 'Print & Layout',
    albums: [
      { id: 'brochure', title: 'Farms Brochure',  match: p => /farms brochure\.pdf$/i.test(p) },
      { id: 'profile',  title: 'Company Profile', match: p => /profile.*\.pdf$/i.test(p) },
      { id: 'mockups',  title: 'Print Mockups',   rest: true }
    ]
  },
  {
    id: 'book',
    dir: 'book',
    name: 'Book Covers',
    tagline: 'Cover design studies, shown on print mockups.',
    disciplines: ['print'],
    year: '2024',
    role: 'Cover Design',
    albums: [{ id: 'covers', title: 'Cover Mockups', rest: true }]
  },
  {
    id: 'wedding',
    dir: 'wedding card website ui',
    name: 'Wedding Card UI',
    tagline: 'Web UI for a wedding-stationery store, laid out desktop-first.',
    disciplines: ['product'],
    year: '2024',
    role: 'UI Design',
    albums: [{ id: 'ui', title: 'Website UI', rest: true }]
  },
  {
    id: 'alteredai',
    dir: 'Alteredai',
    name: 'Altered AI',
    tagline: 'Marketing site concept for an AI imaging product.',
    disciplines: ['product'],
    year: '2023',
    role: 'UI Design',
    albums: [{ id: 'ui', title: 'Website UI', rest: true }]
  }
];

// ---------------------------------------------------------------------------
// Social creatives — the Ecowell output, organised by product line.
// ---------------------------------------------------------------------------
export const SOCIAL_SOURCE = "../../My works/Gallery/Ecowell creatives";

export const SOCIAL_LINES = [
  { dir: 'Diabevita  creatives',      line: 'Diabevita',       blurb: 'Blood-sugar support' },
  { dir: 'Plant protein creatives',   line: 'Plant Protein',   blurb: 'Plant protein' },
  { dir: 'Skin power  creatives ',    line: 'Skin Power',      blurb: 'Skin & collagen' },
  { dir: 'Stamina booster creatives', line: 'Stamina Booster', blurb: 'Performance' },
  { dir: 'shilajit gold creatives',   line: 'Shilajit Gold',   blurb: 'Shilajit' },
  { dir: '.',                         line: 'Brand',           blurb: 'House brand' }
];
