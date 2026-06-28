// Keep collection audio mutually exclusive across document-preserving navigation.
declare global {
  interface Window {
    __collectionAudioBound?: boolean;
  }
}

if (!window.__collectionAudioBound) {
  window.__collectionAudioBound = true;
  document.addEventListener(
    'play',
    (event) => {
      const target = event.target;
      if (!(target instanceof HTMLAudioElement)) return;
      if (!target.closest('[data-collection-item]')) return;

      document
        .querySelectorAll<HTMLAudioElement>('[data-collection-item] audio')
        .forEach((other) => {
          if (other !== target) other.pause();
        });
    },
    true,
  );
}

export {};
