import { useEffect, useState } from "react";
import { useToast } from "@barely/toast";

export function useCopy() {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator?.clipboard
      ?.writeText(text)
      .then(() => setIsCopied(true))
      .then(() => {
        toast.success("Copied to clipboard!");
      })
      .catch((error) => console.error("Copy to clipboard failed:", error));
  };

  const resetCopyStatus = () => {
    setIsCopied(false);
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(resetCopyStatus, 3000); // Reset copy status after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  return { isCopied, copyToClipboard, resetCopyStatus };
}
