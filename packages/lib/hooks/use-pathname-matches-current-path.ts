import { usePathname } from "next/navigation";

export function usePathnameMatchesCurrentPath(path: string) {
  const pathname = usePathname() as null | string;

  return pathname ? pathname === path : false;
}
