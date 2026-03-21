'use client';
import { useState, useCallback, useEffect, useRef } from 'react';

interface ToastState {
  msg: string;
  type: 'success' | 'info' | 'error';
  visible: boolean;
}

let globalShowToast: ((msg: string, type?: 'success' | 'info' | 'error') => void) | null = null;

export function toast(msg: string, type: 'success' | 'info' | 'error' = 'success') {
  if (globalShowToast) globalShowToast(msg, type);
}

export default function Toast() {
  const [state, setState] = useState<ToastState>({ msg: '', type: 'success', visible: false });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setState({ msg, type, visible: true });
    timerRef.current = setTimeout(() => {
      setState(s => ({ ...s, visible: false }));
    }, 3000);
  }, []);

  useEffect(() => {
    globalShowToast = show;
    return () => { globalShowToast = null; };
  }, [show]);

  return (
    <div className={`toast${state.visible ? ' show' : ''}`} id="toast">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" id="toast-icon">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span id="toast-msg">{state.msg}</span>
    </div>
  );
}
