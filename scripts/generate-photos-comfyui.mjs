#!/usr/bin/env node
// Placeholder photography generator — NOT part of the build.
//
// Every `base` name below corresponds to a `pz-picture`/`pz-plate` slot in the
// app. Until Virginia's real photo session happens, each slot needs SOMETHING
// characteristic of the service it illustrates, so the site can be shown to
// clients without empty frames. This script fills them from a local ComfyUI
// instance and writes `public/images/<base>.jpg`, which is exactly the file
// `scripts/generate-image-variants.mjs` then turns into the responsive
// avif/webp/jpg set. Swapping in a real photo is therefore a one-file copy
// over the same name — see README, "Swapping in real photography".
//
// Model: FLUX.1-schnell (Q4 GGUF). An earlier pass used SDXL Turbo and every
// hair close-up came out reading as straw or wire rather than hair — turbo's
// 1-4 step distillation cannot hold fine repeated strand detail. Schnell is
// also 4 steps but holds it. Requires the `ComfyUI-GGUF` custom node.
//
// Usage (ComfyUI listening on 127.0.0.1:8188):
//   node scripts/generate-photos-comfyui.mjs              # every slot
//   node scripts/generate-photos-comfyui.mjs resultado-olivo salon-interior-1

import { existsSync, mkdirSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

const HOST = process.env.COMFYUI_HOST ?? 'http://127.0.0.1:8188';
const OUT = join(process.cwd(), 'public', 'images');
mkdirSync(OUT, { recursive: true });

const UNET = 'flux1-schnell-Q4_K_S.gguf';
const T5 = 't5xxl_fp8_e4m3fn.safetensors';
const CLIP_L = 'clip_l.safetensors';
const VAE = 'ae.safetensors';

// One shared closing clause keeps all 21 frames looking like one commission
// rather than 21 stock photos. Faces are avoided deliberately: it reads as a
// salon portfolio, it sidesteps uncanny-valley faces, and it keeps the eye on
// the hair, which is the thing being sold.
const LOOK =
  'Shot on a 50mm lens at f/2, soft diffused daylight from a large window, ' +
  'muted natural colour, clean uncluttered background, subject seen from ' +
  'behind or in profile with the face out of frame. Editorial hair-salon ' +
  'portfolio photograph, realistic skin and hair texture, no text, no logos.';

const LANDSCAPE = [1216, 832];
const SQUARE = [1024, 1024];

/** @type {{base: string, prompt: string, size: number[]}[]} */
const SLOTS = [];
const slot = (base, prompt, size = SQUARE) => SLOTS.push({ base, prompt, size });

// ── Romero · coloración vegetal sin amoniaco ────────────────────────────
slot(
  'resultado-romero',
  `A photograph of a woman's long chestnut brown hair, freshly coloured with a warm copper depth, falling over her shoulder. The colour is even from root to tip with no visible regrowth line. ${LOOK}`,
  LANDSCAPE,
);
slot(
  'antes-despues-romero-1',
  `A photograph of the crown of a woman's head, dark brown roots blending seamlessly into the mid-lengths, grey hairs fully covered, natural parting. ${LOOK}`,
);
slot(
  'antes-despues-romero-2',
  `A photograph of a woman's warm brunette hair in soft loose waves over one shoulder, deep natural shine, healthy ends. ${LOOK}`,
);
slot(
  'antes-despues-romero-3',
  `A photograph of the back of a woman's head, freshly coloured deep auburn hair, smooth and evenly toned, brushed straight. ${LOOK}`,
);

// ── Espliego · mechas de autor ──────────────────────────────────────────
slot(
  'resultado-espliego',
  `A photograph of a woman's long hair with sunlit blonde balayage, hand-painted highlights and a soft grown-out root that fades gradually into bright ends. ${LOOK}`,
  LANDSCAPE,
);
slot(
  'antes-despues-espliego-1',
  `A photograph of very fine babylights woven through light brown hair, delicate individual strands catching the light. ${LOOK}`,
);
slot(
  'antes-despues-espliego-2',
  `A photograph of soft beige blonde balayage, a seamless gradient from a darker root to bright ends, hair brushed smooth. ${LOOK}`,
);
slot(
  'antes-despues-espliego-3',
  `A photograph of wavy hair with dimensional blonde highlights catching warm afternoon light. ${LOOK}`,
);

// ── Esparto · rastas ────────────────────────────────────────────────────
slot(
  'resultado-esparto',
  `A photograph of a full head of neat, mature dreadlocks on dark hair, evenly sized and cleanly rooted, gathered over one shoulder. ${LOOK}`,
  LANDSCAPE,
);
slot(
  'antes-despues-esparto-1',
  `A photograph of freshly hand-sectioned dreadlock roots on a scalp, a tidy grid of clean partings. ${LOOK}`,
);
slot(
  'antes-despues-esparto-2',
  `A photograph of long mature dreadlocks gathered over a shoulder, rich texture, warm brown tones. ${LOOK}`,
);
slot(
  'antes-despues-esparto-3',
  `A photograph of the back of a head with a full set of neat dreadlocks of even thickness, natural matte finish. ${LOOK}`,
);

// ── Vid · extensiones de cabello natural ────────────────────────────────
slot(
  'resultado-vid',
  `A photograph of very long, thick, glossy natural hair with lots of movement and volume falling down a back, the extension blend completely invisible. ${LOOK}`,
  LANDSCAPE,
);
slot(
  'antes-despues-vid-1',
  `A photograph of a hairdresser's hands parting a section of hair to reveal a tiny, almost invisible extension bond hidden underneath. ${LOOK}`,
);
slot(
  'antes-despues-vid-2',
  `A photograph of long dark hair with dense healthy ends, brushed perfectly smooth, no thinning at the tips. ${LOOK}`,
);
slot(
  'antes-despues-vid-3',
  `A photograph of hair with added length and volume falling down a back in natural movement, seen from behind. ${LOOK}`,
);

// ── Olivo · rituales y tratamientos capilares ───────────────────────────
slot(
  'resultado-olivo',
  `A photograph of extremely healthy, silky, reflective hair immediately after a deep botanical treatment, a bright band of light running along the smooth surface. ${LOOK}`,
  LANDSCAPE,
);
slot(
  'antes-despues-olivo-1',
  `A photograph of well-hydrated hair ends held between two fingers, no split ends, soft natural sheen. ${LOOK}`,
);
slot(
  'antes-despues-olivo-2',
  `A photograph of a hairdresser's hands applying a thick natural hair mask to the mid-lengths of long hair. Hands only, no face. ${LOOK}`,
);
slot(
  'antes-despues-olivo-3',
  `A photograph of smooth glossy hair strands catching daylight after a conditioning treatment, soft focus falloff. ${LOOK}`,
);

// ── El salón ────────────────────────────────────────────────────────────
slot(
  'salon-interior-1',
  'A photograph of the interior of a small, calm, minimalist hair salon: one styling chair facing a large mirror in a light wooden frame, white walls, a warm wooden shelf holding amber glass bottles and a few sprigs of rosemary and olive, pale wooden floor, bright natural daylight from a tall window. Uncluttered, no people, no text, no logos.',
  [1400, 933],
);

function workflow(prompt, seed, [width, height]) {
  return {
    // FLUX schnell is guidance-distilled: cfg stays at 1.0 and the negative
    // branch is a zeroed-out copy of the positive one. A real negative prompt
    // here does nothing at cfg 1.0 — it would only cost a second text encode.
    '1': { class_type: 'UnetLoaderGGUF', inputs: { unet_name: UNET } },
    '2': {
      class_type: 'DualCLIPLoader',
      inputs: { clip_name1: T5, clip_name2: CLIP_L, type: 'flux' },
    },
    '3': { class_type: 'VAELoader', inputs: { vae_name: VAE } },
    '4': { class_type: 'CLIPTextEncode', inputs: { text: prompt, clip: ['2', 0] } },
    '5': { class_type: 'ConditioningZeroOut', inputs: { conditioning: ['4', 0] } },
    '6': { class_type: 'EmptySD3LatentImage', inputs: { width, height, batch_size: 1 } },
    '7': {
      class_type: 'KSampler',
      inputs: {
        seed,
        steps: 4,
        cfg: 1.0,
        sampler_name: 'euler',
        scheduler: 'simple',
        denoise: 1.0,
        model: ['1', 0],
        positive: ['4', 0],
        negative: ['5', 0],
        latent_image: ['6', 0],
      },
    },
    '8': { class_type: 'VAEDecode', inputs: { samples: ['7', 0], vae: ['3', 0] } },
    '9': { class_type: 'SaveImage', inputs: { filename_prefix: 'pz', images: ['8', 0] } },
  };
}

const openSocket = (clientId) =>
  new Promise((resolve, reject) => {
    const ws = new WebSocket(`${HOST.replace(/^http/, 'ws')}/ws?clientId=${clientId}`);
    ws.addEventListener('open', () => resolve(ws), { once: true });
    ws.addEventListener('error', (event) => reject(new Error(`ws: ${event.message ?? event}`)), {
      once: true,
    });
  });

// Completion is read off the websocket rather than polled from `/history`:
// this ComfyUI install cannot open its SQLite database, so `/history` returns
// nothing even for prompts that executed perfectly.
const waitForImage = (ws, promptId, timeoutMs = 1_800_000) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.removeEventListener('message', onMessage);
      reject(new Error(`timed out waiting for ${promptId}`));
    }, timeoutMs);

    function settle(fn, value) {
      clearTimeout(timer);
      ws.removeEventListener('message', onMessage);
      fn(value);
    }

    function onMessage(event) {
      if (typeof event.data !== 'string') return;
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }
      if (message.data?.prompt_id !== promptId) return;

      if (message.type === 'executed' && message.data.output?.images?.length) {
        settle(resolve, message.data.output.images[0]);
      } else if (message.type === 'execution_error') {
        settle(reject, new Error(JSON.stringify(message.data).slice(0, 400)));
      }
    }

    ws.addEventListener('message', onMessage);
  });

async function generate(job) {
  const clientId = randomUUID();
  const ws = await openSocket(clientId);
  try {
    const seed = Math.floor(Math.random() * 1e15);
    const response = await fetch(`${HOST}/prompt`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt: workflow(job.prompt, seed, job.size), client_id: clientId }),
    });
    if (!response.ok) {
      throw new Error(`queue ${job.base}: ${response.status} ${await response.text()}`);
    }

    const { prompt_id: promptId } = await response.json();
    const image = await waitForImage(ws, promptId);

    const params = new URLSearchParams({
      filename: image.filename,
      subfolder: image.subfolder ?? '',
      type: image.type ?? 'output',
    });
    const png = Buffer.from(await (await fetch(`${HOST}/view?${params}`)).arrayBuffer());

    // Written as .jpg because that is the only extension
    // `generate-image-variants.mjs` treats as a source photo.
    const target = join(OUT, `${job.base}.jpg`);
    await sharp(png).jpeg({ quality: 92, mozjpeg: true }).toFile(target);
    return target;
  } finally {
    ws.close();
  }
}

// FLUX Q4 + the t5xxl encoder is heavy enough that ComfyUI can be killed
// mid-run by anything else memory-hungry on the machine (an `ng build` did
// exactly that). Naming slots explicitly always regenerates them; a bare run
// resumes, skipping whatever already landed, so a crash costs one image.
const requested = process.argv.slice(2);
const jobs = requested.length
  ? SLOTS.filter((job) => requested.includes(job.base))
  : SLOTS.filter((job) => !existsSync(join(OUT, `${job.base}.jpg`)));

if (jobs.length === 0 && requested.length > 0) {
  console.error(`no slots matched: ${requested.join(', ')}`);
  console.error(`known slots:\n  ${SLOTS.map((job) => job.base).join('\n  ')}`);
  process.exitCode = 1;
} else if (jobs.length === 0) {
  console.log('every slot already has a photo — nothing to do');
} else {
  console.log(`generating ${jobs.length} image(s) via ${HOST}`);
  for (const [index, job] of jobs.entries()) {
    const target = await generate(job);
    console.log(`[${index + 1}/${jobs.length}] ${target}`);
  }
  console.log('done — now run `npm run build` to regenerate the responsive variants');
}
