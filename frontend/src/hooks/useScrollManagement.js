import { useEffect, useRef, useCallback } from "react";

/**
 * Manages infinite-scroll-up (load older) and auto-scroll-to-bottom behavior.
 * @param {{ messages: any[], hasMore: boolean, loadMore: () => void, conversationId: string }} opts
 */
export default function useScrollManagement({ messages, hasMore, loadMore, conversationId }) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const loadingMoreRef = useRef(false);
  const prevScrollHeightRef = useRef(0);

  // Auto-scroll to bottom on new messages, or restore position after loading older
  useEffect(() => {
    if (loadingMoreRef.current) {
      const container = containerRef.current;
      if (container) {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - prevScrollHeightRef.current;
      }
      loadingMoreRef.current = false;
    } else {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Scroll to bottom when conversation changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [conversationId]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || !hasMore || loadingMoreRef.current) return;
    if (container.scrollTop < 50) {
      loadingMoreRef.current = true;
      prevScrollHeightRef.current = container.scrollHeight;
      loadMore();
    }
  }, [hasMore, loadMore]);

  return { bottomRef, containerRef, handleScroll };
}
