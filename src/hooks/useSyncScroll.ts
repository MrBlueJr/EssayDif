import { useEffect, useRef } from "react";

export function useSyncScroll() {
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const isSyncingLeft = useRef(false);
  const isSyncingRight = useRef(false);

  useEffect(() => {
    const leftPane = leftPaneRef.current;
    const rightPane = rightPaneRef.current;
    if (!leftPane || !rightPane) return;

    const handleLeftScroll = () => {
      if (isSyncingLeft.current) {
        isSyncingLeft.current = false;
        return;
      }
      isSyncingRight.current = true;
      
      // Simple percentage-based scroll sync for now
      // A more advanced version would use getBoundingClientRect on matched para IDs
      const percentage = leftPane.scrollTop / (leftPane.scrollHeight - leftPane.clientHeight);
      rightPane.scrollTop = percentage * (rightPane.scrollHeight - rightPane.clientHeight);
    };

    const handleRightScroll = () => {
      if (isSyncingRight.current) {
        isSyncingRight.current = false;
        return;
      }
      isSyncingLeft.current = true;
      
      const percentage = rightPane.scrollTop / (rightPane.scrollHeight - rightPane.clientHeight);
      leftPane.scrollTop = percentage * (leftPane.scrollHeight - leftPane.clientHeight);
    };

    leftPane.addEventListener("scroll", handleLeftScroll);
    rightPane.addEventListener("scroll", handleRightScroll);

    return () => {
      leftPane.removeEventListener("scroll", handleLeftScroll);
      rightPane.removeEventListener("scroll", handleRightScroll);
    };
  }, []);

  return { leftPaneRef, rightPaneRef };
}
