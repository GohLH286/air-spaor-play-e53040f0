import { createServerFn } from "@tanstack/react-start";

import { buildMarketSnapshot } from "./market-data.server";

export const getMarketSnapshot = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const force = (input as { force?: boolean } | undefined)?.force;
    return { force: force === true };
  })
  .handler(async ({ data }) => buildMarketSnapshot(data.force));
