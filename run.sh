#!/bin/bash
set -v

# Download the Starboard files and put them in client/{src,build}
./scripts/starboard.ts
# You can run it by hand with a different version if you want
# ./scripts/starboard.ts latest
# ./scripts/starboard.ts 0.7.18

# Build the client
cd client
npm run build
cd -

# Build+Compile (see --help for info)
./scripts/compile.ts --lite --output=bin/localstar-[target] --allow-read \
  --allow-net ./deno/localstar_server.ts

# Embed all the static files and some test notebooks (see --help for info)
# Everything's in client/build now...
./scripts/embed.ts --root=./client/build bin/localstar-*
