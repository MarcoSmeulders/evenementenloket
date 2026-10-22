import { QueryClient } from "@tanstack/react-query";

/**
 * One cache for the app. A draft only changes through this app's own save calls, which
 * write the new draft into the cache, so there is no need to refetch in the background.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: Infinity, retry: false, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});
