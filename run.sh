#!/bin/bash
set -v

# Download the Starboard files
./scripts/starboard.ts
# You can run it by hand with a different version if you want
# ./scripts/starboard.ts latest
# ./scripts/starboard.ts 0.7.18

# Move those files to the client folder so "preact dev" works
# Because "ℹ ｢wds｣: Content not from webpack is served from /client/src"
cp -r starboard-dist/starboard-notebook client/src/starboard-dist

# Build the client
cd client
npm run build
cd -

# Build+Compile (see --help for info)
./scripts/compile.ts --lite --output=bin/localstar-[target] --allow-read \
  --allow-net ./deno/localstar_server.ts

# Embed all the static files and some test notebooks (see --help for info)
./scripts/embed.ts --root=./client/build --root=./starboard-dist \
  --root=./starboard-notebooks bin/localstar-*
