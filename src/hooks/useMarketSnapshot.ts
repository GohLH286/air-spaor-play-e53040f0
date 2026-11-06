import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { getMarketSnapshot } from "@/lib/markets/api";
import type { MarketSnapshot } from "@/lib/markets/types";

const KEY = ["market-snapshot"];

/**
 * The route loader fetches the first snapshot during SSR, so the desk paints
 * with data instead of an empty shell. Refreshes go through the mutation below.
 */
export function useMarketSnapshot(initialData?: MarketSnapshot) {
  const queryClient = useQueryClient();
  const [initialFetchedAt] = useState(() => Date.now());

  const query = useQuery<MarketSnapshot>({
    queryKey: KEY,
    queryFn: () => getMarketSnapshot({ data: { force: false } }),
    initialData,
    initialDataUpdatedAt: initialData ? initialFetchedAt : undefined,
    refetchInterval: 120_000,
    staleTime: 60_000,
    retry: 1,
  });

  const refresh = useMutation({
    mutationFn: () => getMarketSnapshot({ data: { force: true } }),
    onSuccess: (data) => {
      queryClient.setQueryData(KEY, data);
    },
  });

  return { query, refresh };
}
