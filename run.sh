#!/bin/bash
set -v

./scripts/starboard.ts

# ./scripts/starboard.ts latest
# ./scripts/starboard.ts 0.7.14
# ./scripts/starboard.ts 0.7.18

# ℹ ｢wds｣: Content not from webpack is served from /client/src
cp -r starboard-dist/starboard-notebook client/src/starboard-dist

# cd client
# npm run build
# cd -

./scripts/compile.ts --lite --output=bin/localstar-[target] --allow-read \
  --allow-net ./deno/localstar_server.ts

./scripts/embed.ts --root=./client/build --root=./starboard-dist bin/localstar-*
