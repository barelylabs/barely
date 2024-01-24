import { useEffect, useRef, useState } from "react";

export function useContainerWidth() {
  const ref = useRef<HTMLElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (ref.current) {
        setWidth(ref.current.offsetWidth);
      }
    };

    updateWidth(); // Update width on mount

    window.addEventListener("resize", updateWidth); // Update width on window resize

    // Cleanup function to remove event listener
    return () => window.removeEventListener("resize", updateWidth);
  }, []); // Empty dependency array ensures effect runs only on mount and unmount

  return [width, ref] as const;
}

export function useContainerHeight() {
  const ref = useRef<HTMLElement | null>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      if (ref.current) {
        setHeight(ref.current.offsetHeight);
      }
    };

    updateHeight(); // Update height on mount

    window.addEventListener("resize", updateHeight); // Update height on window resize

    // Cleanup function to remove event listener
    return () => window.removeEventListener("resize", updateHeight);
  }, []); // Empty dependency array ensures effect runs only on mount and unmount

  return [height, ref] as const;
}
