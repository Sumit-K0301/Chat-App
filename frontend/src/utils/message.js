/** Shape for a soft-deleted message (used by stores and socket handlers) */
export const DELETED_MESSAGE_FIELDS = {
  isDeleted: true,
  text: null,
  image: null,
  file: { url: null, name: null, type: null, size: null },
};

/** Returns a new message object marked as deleted */
export function markMessageAsDeleted(message) {
  return { ...message, ...DELETED_MESSAGE_FIELDS };
}

let tempCounter = 0;

/**
 * Build an optimistic message for instant UI feedback.
 * @param {{ currentUser, targetId, formData, isGroup }} opts
 */
export function createOptimisticMessage({ currentUser, targetId, formData, isGroup }) {
  const tempId = `temp_${Date.now()}_${++tempCounter}`;
  const imageFile = formData.get("image");
  const localImageUrl = imageFile ? URL.createObjectURL(imageFile) : null;

  const base = {
    _id: tempId,
    text: formData.get("text") || null,
    image: localImageUrl,
    reactions: [],
    createdAt: new Date().toISOString(),
    _isSending: true,
  };

  const msg = isGroup
    ? { ...base, senderID: currentUser, groupId: targetId }
    : { ...base, senderID: currentUser?._id, receiverID: targetId, status: "sending" };

  return { tempId, optimisticMsg: msg, localImageUrl };
}
