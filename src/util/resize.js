import { useState, useEffect, useRef } from "react";

export function useResizeObserver(ref) {
  const [element, setElement] = useState(null);
  const [rect, setRect] = useState({});
  const observer = useRef(null);

  //Clean up observer
  const cleanOb = () => {
    if (observer.current) {
      observer.current.disconnect();
    }
  };

  useEffect(() => {
    setElement(ref.current);
  }, [ref]);

  useEffect(() => {
    if (!element) return;
    // Element has changed, disconnect old observer
    cleanOb();

    const ob = (observer.current = new ResizeObserver(([entry]) => {
      // inlineSize and blockSize in entry.borderBoxSize and contentBoxSize
      // inlineSize means height when write-mode is horizontal, and width when write-mode is vertical.
      // blockSize means width when write-mode is horizontal, and height when write-mode is vertical.
      // So, for the sake of simplicity, I will use getBoundingClientRect
      setRect(entry.target.getBoundingClientRect());
    }));
    ob.observe(element);

    // disconnect when component is unmounted
    return () => {
      cleanOb();
    };
  }, [element]);

  return rect;
}
