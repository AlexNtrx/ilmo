import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";
import { isExternalAdminAuthPath } from "@/lib/auth/config";

const handlers = toNextJsHandler(auth);

function isExternalAdminPluginRequest(request: Request) {
  return isExternalAdminAuthPath(new URL(request.url).pathname);
}

function unavailable() {
  return new Response(null, { status: 404 });
}

export function GET(request: Request) {
  return isExternalAdminPluginRequest(request)
    ? unavailable()
    : handlers.GET(request);
}

export function POST(request: Request) {
  return isExternalAdminPluginRequest(request)
    ? unavailable()
    : handlers.POST(request);
}
