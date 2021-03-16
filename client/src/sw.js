import { getFiles, setupPrecaching, setupRouting } from "preact-cli/sw";

setupRouting();

const urlsToCache = getFiles();
setupPrecaching(urlsToCache);
