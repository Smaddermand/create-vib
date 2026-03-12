export const ciWorkflow = `name: CI

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Copy .env.example files
        shell: bash
        run: find . -type f -name ".env.example" -exec sh -c 'for file do cp "$file" "${'${'}file%.example}.local"; done' sh {} +

      - name: Typecheck
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint
`;
