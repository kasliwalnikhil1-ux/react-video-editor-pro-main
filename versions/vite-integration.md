### Set up a fresh Vite + React app and integrate React Video Editor (Pro)

This document shows how to bootstrap a brand-new Vite + React app and integrate the React Video Editor components so it runs in Vite. It also includes a minimal Node server for the `/api` routes used by the editor for Remotion SSR rendering, plus a Vite dev proxy.

---

### 0) Prerequisites

- Node 18+
- pnpm or npm

---

### 1) Create a Vite + React app (TypeScript)

```bash
# choose either npm or pnpm
npm create vite@latest my-rve-vite -- --template react-ts
cd my-rve-vite
```

---

### 2) Install required dependencies

Core app + editor deps (match your existing versions where possible):

```bash
npm i react react-dom zustand uuid clsx tailwind-merge tailwindcss-animate
npm i @remotion/bundler@4.0.272 @remotion/cli@4.0.272 @remotion/google-fonts@4.0.272 \
      @remotion/player@4.0.272 @remotion/renderer@4.0.272 remotion@4.0.272

# Optional UI libs used by the editor (install those you actually use)
npm i @radix-ui/react-alert-dialog @radix-ui/react-avatar @radix-ui/react-collapsible \
      @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu \
      @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-scroll-area \
      @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider \
      @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs \
      @radix-ui/react-toast @radix-ui/react-toggle @radix-ui/react-toggle-group \
      @radix-ui/react-tooltip lucide-react

# Analytics (optional)
npm i posthog-js

# Styling
npm i -D tailwindcss @tailwindcss/postcss postcss

# Vite + React plugin + dev helpers
npm i -D vite @vitejs/plugin-react concurrently tsx typescript
```

---

### 3) Tailwind setup

Tailwind v4 works via PostCSS plugin. Create `postcss.config.js`:

```js
// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

Create `src/index.css` and import Tailwind:

```css
@import "tailwindcss";
/* your global styles can go here too */
html, body, #root { height: 100%; }
```

Update `src/main.tsx` to import the stylesheet:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

### 4) Copy the React Video Editor code into `src/`

From your existing project, copy the following into the new Vite app:

- `app/reactvideoeditor/pro/` → `src/reactvideoeditor/pro/`
- `app/constants.ts` → `src/constants.ts`
- Any CSS under `app/reactvideoeditor/pro/styles*` → `src/reactvideoeditor/pro/styles*`
- Any required assets → `public/` (videos under `public/rendered-videos/` stay the same)

Then update any import paths that reference `./app/...` to point at the new `src/...` locations. Example inside `src/App.tsx`:

```tsx
import { HttpRenderer } from './reactvideoeditor/pro/utils/http-renderer';
import { ReactVideoEditor } from './reactvideoeditor/pro/components/react-video-editor';
import { createPexelsVideoAdaptor } from './reactvideoeditor/pro/adaptors/pexels-video-adaptor';
import { createPexelsImageAdaptor } from './reactvideoeditor/pro/adaptors/pexels-image-adaptor';
import { DEFAULT_OVERLAYS } from './constants';
import { Toaster } from './reactvideoeditor/pro/components/ui/toaster';
import { PostHogProvider } from './reactvideoeditor/pro/components/providers/posthog-provider';

export function App() {
  const PROJECT_ID = 'TestComponent';

  const ssrRenderer = React.useMemo(() =>
    new HttpRenderer('/api/latest/ssr', {
      type: 'ssr',
      entryPoint: '/api/latest/ssr',
    }), []);

  const availableThemes = [
    { id: 'rve', name: 'RVE', className: 'rve', color: '#3E8AF5' },
  ];

  return (
    <PostHogProvider>
      <main className="w-full h-full fixed inset-0">
        <ReactVideoEditor
          projectId={PROJECT_ID}
          defaultOverlays={DEFAULT_OVERLAYS as any}
          fps={30}
          renderer={ssrRenderer}
          disabledPanels={[]}
          availableThemes={availableThemes}
          defaultTheme="dark"
          adaptors={{
            video: [createPexelsVideoAdaptor(import.meta.env.VITE_PEXELS_API_KEY)],
            images: [createPexelsImageAdaptor(import.meta.env.VITE_PEXELS_API_KEY)],
          }}
          showDefaultThemes={true}
          sidebarWidth="clamp(350px, 25vw, 500px)"
          sidebarIconWidth="57.6px"
          showIconTitles={false}
        />
        <Toaster />
      </main>
    </PostHogProvider>
  );
}
```

Also create a basic `index.html` at project root (Vite scaffold gives you one): ensure it contains `<div id="root"></div>`.

---

### 5) Environment variables for Vite

Create `.env.local` (or `.env`) in the Vite project and define client-side vars with `VITE_` prefix:

```env
VITE_PEXELS_API_KEY=your_pexels_api_key
VITE_POSTHOG_ENABLED=false
VITE_POSTHOG_KEY=
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

Use them in code via `import.meta.env.VITE_*`.

---

### 6) Minimal Node server for SSR rendering

The editor calls `/api/latest/ssr/*` to render videos via Remotion. Create a small server using Express.

Install server runtime deps:

```bash
npm i express zod
```

Create `server/index.ts`:

```ts
import express from 'express';
import path from 'path';
import { z } from 'zod';
import { startRendering, getRenderProgress } from './lib/remotion-renderer';

const app = express();
app.use(express.json({ limit: '10mb' }));

const RenderRequest = z.object({
  id: z.string(),
  inputProps: z.object({
    overlays: z.array(z.any()),
    durationInFrames: z.number(),
    fps: z.number(),
    width: z.number(),
    height: z.number(),
    src: z.string().optional(),
    selectedOverlayId: z.number().nullable().optional(),
    baseUrl: z.string().optional(),
  }),
});

app.post('/api/latest/ssr/render', async (req, res) => {
  try {
    const data = RenderRequest.parse(req.body);
    const renderId = await startRendering(data.id, data.inputProps);
    res.json({ renderId, bucketName: undefined });
  } catch (err: any) {
    if (err?.issues) return res.status(400).json({ error: 'Invalid request data', details: err.issues });
    res.status(500).json({ error: 'Failed to start render' });
  }
});

app.get('/api/latest/ssr/progress', (req, res) => {
  try {
    const renderId = String(req.query.renderId || '');
    const progress = getRenderProgress(renderId);
    res.json(progress);
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Invalid renderId' });
  }
});

app.use('/rendered-videos', express.static(path.join(process.cwd(), 'public', 'rendered-videos')));

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
```

Create `server/lib/remotion-renderer.ts` (adapted from your existing code):

```ts
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition, RenderMediaOnProgress } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const VIDEOS_DIR = path.join(process.cwd(), 'public', 'rendered-videos');
if (!fs.existsSync(VIDEOS_DIR)) fs.mkdirSync(VIDEOS_DIR, { recursive: true });

export const renderProgress = new Map<string, number>();
export const renderStatus = new Map<string, 'rendering' | 'done' | 'error'>();
export const renderErrors = new Map<string, string>();
export const renderUrls = new Map<string, string>();
export const renderSizes = new Map<string, number>();

export async function startRendering(compositionId: string, inputProps: Record<string, unknown>) {
  const renderId = uuidv4();
  renderStatus.set(renderId, 'rendering');
  renderProgress.set(renderId, 0);

  (async () => {
    try {
      const baseUrl = process.env.BASE_URL ?? 'http://localhost:5173';

      const bundleLocation = await bundle(
        path.join(process.cwd(), 'src', 'reactvideoeditor', 'pro', 'utils', 'remotion', 'index.ts'),
        undefined,
        {
          webpackOverride: (config) => ({
            ...config,
            resolve: {
              ...config.resolve,
              fallback: {
                ...config.resolve?.fallback,
                '@remotion/compositor': false,
                '@remotion/compositor-darwin-arm64': false,
                '@remotion/compositor-darwin-x64': false,
                '@remotion/compositor-linux-arm64': false,
                '@remotion/compositor-linux-x64': false,
                '@remotion/compositor-win32-x64-msvc': false,
                '@remotion/compositor-windows-x64': false,
              },
            },
          }),
        }
      );

      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: compositionId,
        inputProps: { ...inputProps, baseUrl },
      });

      const actualDurationInFrames = (inputProps.durationInFrames as number) || composition.durationInFrames;

      await renderMedia({
        codec: 'h264',
        composition: { ...composition, durationInFrames: actualDurationInFrames },
        serveUrl: bundleLocation,
        outputLocation: path.join(VIDEOS_DIR, `${renderId}.mp4`),
        inputProps: { ...inputProps, baseUrl },
        chromiumOptions: { headless: true },
        timeoutInMilliseconds: 300000,
        onProgress: ((p) => renderProgress.set(renderId, p.progress)) as RenderMediaOnProgress,
        crf: 18,
        imageFormat: 'png',
      });

      const stats = fs.statSync(path.join(VIDEOS_DIR, `${renderId}.mp4`));
      renderStatus.set(renderId, 'done');
      renderUrls.set(renderId, `/rendered-videos/${renderId}.mp4`);
      renderSizes.set(renderId, stats.size);
    } catch (err: any) {
      renderStatus.set(renderId, 'error');
      renderErrors.set(renderId, err?.message || 'render failed');
    }
  })();

  return renderId;
}

export function getRenderProgress(renderId: string) {
  if (!renderStatus.has(renderId)) throw new Error(`No render found with ID: ${renderId}`);
  return {
    renderId,
    progress: renderProgress.get(renderId) || 0,
    status: renderStatus.get(renderId) || 'rendering',
    error: renderErrors.get(renderId),
    url: renderUrls.get(renderId),
    size: renderSizes.get(renderId),
  };
}
```

---

### 7) Vite config with API proxy

Create `vite.config.ts` to proxy `/api` to the Node server:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: { sourcemap: true },
});
```

---

### 8) package.json scripts

Add scripts to run Vite and the Node server together in dev:

```json
{
  "scripts": {
    "dev:client": "vite",
    "dev:server": "tsx server/index.ts",
    "dev": "concurrently -n client,server -c blue,magenta \"npm:dev:client\" \"npm:dev:server\"",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

You can optionally add a separate server build step with `tsc` if you deploy the server separately.

---

### 9) Run it

```bash
npm run dev
```

Open `http://localhost:5173`. The editor should load, and when you trigger a render it will call the Express API via the Vite proxy and write outputs to `public/rendered-videos/`.

---

### 10) Production deployment (high level)

- Build the client: `npm run build` → outputs `dist/`
- Serve `dist/` statics and run your Node server for `/api` routes on the same host or behind a reverse proxy
- Ensure `BASE_URL` is set for the server (e.g., to your site origin) so Remotion can resolve media URLs correctly

---

### Troubleshooting tips

- If imports fail, double-check that all editor files were copied under `src/reactvideoeditor/pro/` and imports updated.
- Ensure `VITE_*` env vars are set; Vite does not expose non-`VITE_` vars to the browser.
- Chromium on CI: Remotion may need additional libraries in Linux environments; consult Remotion docs if headless Chrome fails to start.


