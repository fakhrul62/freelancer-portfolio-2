export {};

type Message =
  | { type: "init"; canvas: OffscreenCanvas; mobile: boolean; paused: boolean }
  | { type: "resize"; width: number; height: number }
  | { type: "scroll"; progress: number }
  | { type: "pause"; paused: boolean };

const FRAME_COUNT = 600;
const bitmaps = new Map<number, ImageBitmap>();
const blobs = new Map<number, Blob>();
const pending = new Set<number>();
const failed = new Set<number>();
let canvas: OffscreenCanvas;
let context: OffscreenCanvasRenderingContext2D | null;
let mobile = false;
let paused = true;
let progressive = false;
let target = 0;
let direction = 1;
let active = 0;
let raf = 0;
let lastDrawn = -1;
let displayed = 0;
let velocity = 0;
let previousTime = 0;
let lastPair = "";

function schedule() {
  if (!raf && !paused) raf = requestAnimationFrame(render);
}

function trim() {
  const limit = mobile ? 24 : 20;
  while (bitmaps.size > limit) {
    let farthest = -1;
    let distance = -1;
    for (const key of bitmaps.keys()) {
      if (key === Math.floor(displayed) || key === Math.ceil(displayed)) continue;
      const score = Math.min(Math.abs(key - target), Math.abs(key - displayed) + 6);
      if (score > distance) { farthest = key; distance = score; }
    }
    bitmaps.get(farthest)?.close();
    bitmaps.delete(farthest);
  }
}

async function load(index: number, decode: boolean) {
  pending.add(index);
  active++;
  try {
    let blob = blobs.get(index);
    if (!blob) {
      const tier = mobile ? "mobile" : "desktop";
      const response = await fetch(`/earth/v2/${tier}/earth-${String(index + 1).padStart(3, "0")}.webp`, { cache: "force-cache" });
      if (!response.ok) throw new Error("Frame unavailable");
      blob = await response.blob();
      blobs.set(index, blob);
      if (blobs.size > 120) {
        const farthest = [...blobs.keys()].sort((a, b) => Math.abs(b - target) - Math.abs(a - target))[0];
        blobs.delete(farthest);
      }
    }
    if (decode && !paused && Math.min(Math.abs(index - target), Math.abs(index - displayed)) < 24) {
      const bitmap = await createImageBitmap(blob);
      if (paused) bitmap.close();
      else { bitmaps.set(index, bitmap); trim(); schedule(); }
    }
  } catch {
    failed.add(index);
  } finally {
    pending.delete(index);
    active--;
    pump();
  }
}

function pump() {
  if (paused || !context) return;
  const center = Math.round(target);
  const leading = Math.max(0, Math.min(FRAME_COUNT - 1, displayed + Math.max(-10, Math.min(10, velocity * 0.08))));
  const nearby = [Math.floor(displayed), Math.ceil(displayed), Math.floor(leading), Math.ceil(leading), center, Math.floor(target), Math.ceil(target)];
  for (let offset = 1; offset <= 8; offset++) {
    nearby.push(center + offset * direction);
    if (offset <= 3) nearby.push(center - offset * direction);
  }
  while (active < 4) {
    const next = nearby.find(index => index >= 0 && index < FRAME_COUNT && !pending.has(index) && !failed.has(index) && !bitmaps.has(index));
    if (next !== undefined) { void load(next, true); continue; }
    if (!progressive) break;
    const ahead: number[] = [];
    for (let offset = 4; offset <= 40; offset++) ahead.push(center + offset * direction, center - offset * direction);
    const preload = ahead.find(index => index >= 0 && index < FRAME_COUNT && !blobs.has(index) && !pending.has(index) && !failed.has(index));
    if (preload === undefined) break;
    void load(preload, false);
  }
}

function render(time: number) {
  raf = 0;
  if (!context || paused) return;
  const elapsed = previousTime ? Math.min(40, time - previousTime) : 8.33;
  previousTime = time;
  // Exact critically damped spring: continuous speed through wheel events,
  // refresh-rate independent, with no oscillation around the scroll position.
  const dt = elapsed / 1000;
  const frequency = 30;
  const offset = displayed - target;
  const impulse = velocity + frequency * offset;
  const decay = Math.exp(-frequency * dt);
  const proposed = target + (offset + impulse * dt) * decay;
  const next = Math.max(0, Math.min(FRAME_COUNT - 1, proposed));
  const nextVelocity = (velocity - frequency * impulse * dt) * decay;
  // Interpolate between available frames, including across a temporary loading gap.
  let lower = -1;
  let upper = FRAME_COUNT;
  for (const key of bitmaps.keys()) {
    if (key <= next && key > lower) lower = key;
    if (key >= next && key < upper) upper = key;
  }
  if (lower < 0 || upper === FRAME_COUNT) {
    // Keep the last image until the requested range is buffered; never jump
    // to an arbitrary nearest frame when network responses arrive out of order.
    pump();
    previousTime = 0;
    return;
  }
  const settled = Math.abs(target - next) < 0.01 && Math.abs(nextVelocity) < 0.25;
  displayed = settled ? target : next;
  velocity = settled ? 0 : nextVelocity;
  const first = bitmaps.get(lower)!;
  const second = bitmaps.get(upper)!;
  const pair = `${lower}:${upper}`;
  if (displayed === lastDrawn && pair === lastPair) return;
  const scale = mobile ? canvas.width / first.width : Math.max(canvas.width / first.width, canvas.height / first.height);
  const width = first.width * scale;
  const height = first.height * scale;
  const x = (canvas.width - width) / 2;
  const y = (canvas.height - height) * (mobile ? 0.2 : 0.5);
  context.globalAlpha = 1;
  if (mobile) {
    context.fillStyle = "#08090b";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(first, x, y, width, height);
  if (upper !== lower) {
    context.globalAlpha = Math.min(1, Math.max(0, (displayed - lower) / (upper - lower)));
    context.drawImage(second, x, y, width, height);
    context.globalAlpha = 1;
  }
  lastDrawn = displayed;
  lastPair = pair;
  self.postMessage({ frame: displayed, cached: bitmaps.size });
  pump();
  if (displayed !== target) schedule();
  else previousTime = 0;
}

self.onmessage = ({ data }: MessageEvent<Message>) => {
  switch (data.type) {
    case "init":
      canvas = data.canvas;
      mobile = data.mobile;
      paused = data.paused;
      context = canvas.getContext("2d", { alpha: false });
      setTimeout(() => { progressive = true; pump(); }, 1800);
      break;
    case "resize":
      if (canvas.width === data.width && canvas.height === data.height) break;
      canvas.width = data.width;
      canvas.height = data.height;
      lastDrawn = -1;
      break;
    case "scroll": {
      const next = data.progress * (FRAME_COUNT - 1);
      direction = next >= target ? 1 : -1;
      target = next;
      break;
    }
    case "pause":
      paused = data.paused;
      if (paused) {
        cancelAnimationFrame(raf);
        raf = 0;
        for (const bitmap of bitmaps.values()) bitmap.close();
        bitmaps.clear();
        lastDrawn = -1;
        previousTime = 0;
        velocity = 0;
      }
      break;
  }
  schedule();
  pump();
};
