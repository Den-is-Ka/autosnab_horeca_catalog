import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import type { NextRequest } from "next/server";

const model =
  process.env.COPILOTKIT_MODEL?.trim() || "openai:gpt-5.4-mini";

const builtInAgent = new BuiltInAgent({
  model,
});

const runtime = new CopilotRuntime({
  agents: {
    default: builtInAgent,
  },
});

export const POST = async (request: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(request);
};
