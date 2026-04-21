export const requestPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

const sendNotification = (title: string, body: string): void => {
  if (Notification.permission !== 'granted') return;
  new Notification(title, { body, icon: '/favicon.ico' });
};

export const notifyQuiet = (officeName: string, count: number): void => {
  sendNotification(
    `Queue is quiet at ${officeName}`,
    `Only ${count} people in queue right now. Good time to go!`
  );
};

export const notifySurge = (
  officeName: string,
  oldCount: number,
  newCount: number
): void => {
  sendNotification(
    `Surge alert — ${officeName}`,
    `Queue jumped from ${oldCount} → ${newCount} people. You may want to wait.`
  );
};