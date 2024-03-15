import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { SessionWorkspace } from "../server/auth";

export function useWorkspaceHotkeys({
  workspace,
}: {
  workspace: SessionWorkspace;
}) {
  const router = useRouter();

  const [gKeyPressed, setGKeyPressed] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      const noMetaKey = !e.metaKey && !e.ctrlKey;
      const notInInput =
        target.tagName !== "INPUT" && target.tagName !== "TEXTAREA";

      if (e.key === "g" && noMetaKey && notInInput) {
        setGKeyPressed(true);
        setTimeout(() => {
          setGKeyPressed(false);
        }, 500); // Reset gKeyPressed after 0.5 seconds
      }
      if (e.key === "l" && gKeyPressed && noMetaKey && notInInput) {
        router.push(`/${workspace.handle}/links`);
        setGKeyPressed(false);
      }
      if (e.key === "m" && gKeyPressed && noMetaKey && notInInput) {
        router.push(`/${workspace.handle}/media`);
        setGKeyPressed(false);
      }
      if (e.key === "s" && gKeyPressed && noMetaKey && notInInput) {
        router.push(`/${workspace.handle}/settings`);
        setGKeyPressed(false);
      }
      if (e.key === "t" && gKeyPressed && noMetaKey && notInInput) {
        router.push(`/${workspace.handle}/tracks`);
        setGKeyPressed(false);
      }
      if (e.key === "x" && gKeyPressed && noMetaKey && notInInput) {
        router.push(`/${workspace.handle}/mixtapes`);
        setGKeyPressed(false);
      }
    },
    [gKeyPressed, router, workspace.handle],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [gKeyPressed, handleKeyDown]);
}
