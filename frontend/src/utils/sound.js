const notificationSound = new Audio("/notification.mp3");
notificationSound.volume = 0.3;

export function playNotificationSound() {
  notificationSound.currentTime = 0;
  notificationSound.play().catch(() => {});
}
