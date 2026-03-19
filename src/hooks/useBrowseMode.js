import { useState, useEffect, useRef, useCallback } from 'react';
import { speak } from '../lib/speech';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function useBrowseMode() {
  const [browseIndex, setBrowseIndex] = useState(null);
  const [browseQueue, setBrowseQueue] = useState([]);
  const [listening, setListening] = useState(false);
  const listeningRef = useRef(false);
  const wakeLockRef = useRef(null);

  const isOpen = browseIndex !== null && browseQueue.length > 0 && browseIndex < browseQueue.length;
  const currentWord = isOpen ? browseQueue[browseIndex] : null;

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    setListening(false);
    speechSynthesis.cancel();
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
  }, []);

  const startListening = useCallback(async (queue, startIdx) => {
    listeningRef.current = true;
    setListening(true);
    try {
      if (navigator.wakeLock) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch {}

    for (let i = startIdx; i < queue.length; i++) {
      if (!listeningRef.current) return;
      setBrowseIndex(i);
      await speak(queue[i].word);
      if (!listeningRef.current) return;
      await new Promise(r => setTimeout(r, 3000));
    }
    stopListening();
  }, [stopListening]);

  function open(words) {
    setBrowseQueue(shuffle(words));
    setBrowseIndex(0);
  }

  function openWithListening(words) {
    const q = shuffle(words);
    setBrowseQueue(q);
    setBrowseIndex(0);
    startListening(q, 0);
  }

  function close() {
    stopListening();
    setBrowseIndex(null);
    setBrowseQueue([]);
  }

  function prev() {
    stopListening();
    setBrowseIndex(browseIndex - 1);
  }

  function next() {
    stopListening();
    setBrowseIndex(browseIndex + 1);
  }

  useEffect(() => {
    if (browseIndex !== null) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [browseIndex !== null]);

  useEffect(() => {
    return () => { stopListening(); };
  }, [stopListening]);

  return {
    isOpen,
    currentWord,
    browseIndex,
    browseQueue,
    listening,
    open,
    openWithListening,
    close,
    prev: browseIndex > 0 ? prev : null,
    next: browseIndex < browseQueue.length - 1 ? next : null,
    startListening,
    stopListening,
  };
}
