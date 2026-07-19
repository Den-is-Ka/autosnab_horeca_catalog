import { createOpenAI } from "@ai-sdk/openai";
import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import type { NextRequest } from "next/server";

const aimockBaseUrl =
  process.env.AIMOCK_BASE_URL?.trim() ||
  "http://127.0.0.1:4010/v1";

const mockOpenAI = createOpenAI({
  apiKey: "aimock-local-key",
  baseURL: aimockBaseUrl,
});

const builtInAgent = new BuiltInAgent({
  model: mockOpenAI("horeca-catalog-mock"),
});

const runtime = new CopilotRuntime({
  agents: {
    default: builtInAgent,
  },
});

export const POST = async (request: NextRequest) => {
  const { handleRequest } =
    copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      endpoint: "/api/copilotkit",
    });

  return handleRequest(request);
};
