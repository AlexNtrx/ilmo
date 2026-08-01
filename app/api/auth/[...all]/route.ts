import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";
import { isExternalAdminAuthPath } from "@/lib/auth/config";

const handlers = toNextJsHandler(auth);

/** Identifies Admin-plugin endpoints that must remain unavailable to external callers. */
function isExternalAdminPluginRequest(request: Request) {
  return isExternalAdminAuthPath(new URL(request.url).pathname);
}

function unavailable() {
  return new Response(null, { status: 404 });
}

/** Handles permitted Better Auth reads while keeping admin operations server-owned. */
export function GET(request: Request) {
  return isExternalAdminPluginRequest(request)
    ? unavailable()
    : handlers.GET(request);
}

/** Handles permitted Better Auth writes while blocking direct admin API access. */
export function POST(request: Request) {
  return isExternalAdminPluginRequest(request)
    ? unavailable()
    : handlers.POST(request);
}
