import { useMemo } from "react";

export default function useQueryParam(search) {
  return useMemo(() => {
    const p = new URLSearchParams(search || window.location.search);
    return Object.fromEntries(p.entries());
  }, [search]);
}
