# Perps App Monorepo

## Getting Started on Local Instance

1. Make sure you have pnpm package manager installed
2. Run `git submodule update --init --recursive` to update
3. **NOTE:** You'll need to request access to TradingView advanced charting library
4. Run `pnpm dev` to launch a local host

## Setup

```bash
pnpm install
pnpm prepare
pnpm update-submodules
```

## Develop Frontend

```bash
cd packages/frontend
pnpm dev
```

## Develop Frontend Shortcut (setup and run from root directory)

```bash
pnpm dev
```

## Troubleshooting (if app/tv submodule directory not getting populated)

```bash
git submodule update --init --recursive
```

## Start Frontend in Production Mode

```bash
cd packages/frontend
pnpm build
pnpm start
```

## Using the SDK in the Frontend

```ts
import { Info } from '@perps-app/sdk';

const info = new Info();
```

Please refer to the [examples](./packages/sdk/examples) in the sdk package for more usage examples.
