import { useEffect, useRef } from "react";
import useSocketStore from "../store/useSocketStore";

export default function useTyping(receiverId, isGroup = false) {
  const timerRef = useRef(null);
  const isTypingRef = useRef(false);

  const { emitTyping, emitStopTyping, emitGroupTyping, emitGroupStopTyping } =
    useSocketStore();

  const startTyping = () => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      if (isGroup) {
        emitGroupTyping(receiverId);
      } else {
        emitTyping(receiverId);
      }
    }
    // Reset the stop timer
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      if (isGroup) {
        emitGroupStopTyping(receiverId);
      } else {
        emitStopTyping(receiverId);
      }
    }, 2000);
  };

  const stopTyping = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      if (isGroup) {
        emitGroupStopTyping(receiverId);
      } else {
        emitStopTyping(receiverId);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (isTypingRef.current) {
        if (isGroup) {
          emitGroupStopTyping(receiverId);
        } else {
          emitStopTyping(receiverId);
        }
      }
    };
  }, [receiverId, isGroup]);

  return { startTyping, stopTyping };
}
