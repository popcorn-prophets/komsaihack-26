import { useEffect, useState } from 'react';

export function useTypewriter(
  words: string[],
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseDuration = 1500
) {
  const [displayText, setDisplayText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (isLocked) return;

    const currentWord = words[wordIndex];
    const isLastWord = wordIndex === words.length - 1;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayText.length < currentWord.length) {
            setDisplayText(currentWord.slice(0, displayText.length + 1));
          } else {
            if (isLastWord) {
              setIsLocked(true);
            } else {
              setTimeout(() => setIsDeleting(true), pauseDuration);
            }
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText(displayText.slice(0, -1));
          } else {
            setIsDeleting(false);
            setWordIndex((prev) => prev + 1);
          }
        }
      },
      isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(timeout);
  }, [
    displayText,
    isDeleting,
    wordIndex,
    words,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    isLocked,
  ]);

  return { displayText, isLocked };
}
