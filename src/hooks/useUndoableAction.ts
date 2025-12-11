import { useEffect, useRef, useState } from "react";

type UndoAction = () => Promise<void> | void;

export interface PendingUndo {
  id: string;
  label: string;
  startedAt: number;
}

export const useUndoableAction = () => {
  const [pending, setPending] = useState<PendingUndo | null>(null);
  const [progress, setProgress] = useState(0);
  const actionRef = useRef<UndoAction | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const schedule = (label: string, action: UndoAction) => {
    clearTimer();
    actionRef.current = action;
    const startedAt = Date.now();
    setPending({ id: `${startedAt}`, label, startedAt });
    setProgress(0);
    timerRef.current = setTimeout(async () => {
      if (actionRef.current) {
        await actionRef.current();
      }
      setPending(null);
      setProgress(0);
      actionRef.current = null;
      timerRef.current = null;
    }, 5000);
  };

  const undo = () => {
    clearTimer();
    actionRef.current = null;
    setPending(null);
    setProgress(0);
  };

  useEffect(() => {
    if (!pending) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - pending.startedAt;
      setProgress(Math.min(100, (elapsed / 5000) * 100));
    }, 100);
    return () => clearInterval(interval);
  }, [pending]);

  return { pending, progress, schedule, undo };
};
