import {
  cloneElement,
  isValidElement,
  useCallback,
  useRef,
} from "react";

export function useHiddenAdminTap({
  onTrigger,
  requiredTaps = 5,
  windowMs = 2000,
}) {
  const countRef = useRef(0);
  const timerRef = useRef(null);
  const onTriggerRef = useRef(onTrigger);
  onTriggerRef.current = onTrigger;

  const onInteract = useCallback(() => {
    countRef.current += 1;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (countRef.current >= requiredTaps) {
      countRef.current = 0;
      onTriggerRef.current?.();
      return;
    }

    timerRef.current = setTimeout(() => {
      countRef.current = 0;
      timerRef.current = null;
    }, windowMs);
  }, [requiredTaps, windowMs]);

  return { onInteract };
}

/**
 * Merges a secret tap sequence into a single child element (e.g. logo button).
 */
export default function HiddenAdminTrigger({
  children,
  onTrigger,
  requiredTaps = 5,
  windowMs = 2000,
}) {
  const { onInteract } = useHiddenAdminTap({
    onTrigger,
    requiredTaps,
    windowMs,
  });

  if (!isValidElement(children)) {
    return children;
  }

  const prevClick = children.props.onClick;

  return cloneElement(children, {
    onClick: (event) => {
      prevClick?.(event);
      onInteract();
    },
  });
}
