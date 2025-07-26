#!/bin/bash
set -e

# Install dependencies
pnpm install

# Generate Prisma client
npx prisma generate

# Build the Next.js app
pnpm run build
