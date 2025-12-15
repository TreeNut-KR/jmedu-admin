import { useState, useEffect, useCallback, useMemo } from "react";

export function useMediaQuery(query: string): boolean {
  const media = useMemo(() => window.matchMedia(query), [query]);
  const [matches, setMatches] = useState<boolean>(false);

  const listener = useCallback(() => {
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
  }, [media, matches]);

  useEffect(() => {
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [media, listener]);

  return matches;
}
