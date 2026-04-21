import { getWatchlist, updateLastCount } from './watchlist';
import { notifyQuiet, notifySurge } from './notifications';
import { getOfficeQueue } from '../api/queue';

let watcherInterval: ReturnType<typeof setInterval> | null = null;

export const startWatcher = (): void => {
  if (watcherInterval) return;

  watcherInterval = setInterval(async () => {
    const watchlist = getWatchlist();
    const officeIds = Object.keys(watchlist);
    if (officeIds.length === 0) return;

    for (const officeId of officeIds) {
      try {
        const data = await getOfficeQueue(officeId);
        const entry = watchlist[officeId];
        const currentCount = data.current_count;
        const lastCount = entry.lastCount;

        if (lastCount === null) {
          updateLastCount(officeId, currentCount);
          continue;
        }

        // Quiet alert
        if (
          lastCount >= entry.quietThreshold &&
          currentCount < entry.quietThreshold &&
          !entry.isEnRoute
        ) {
          notifyQuiet(entry.officeName, currentCount);
        }

        // Surge alert — only when en route
        if (
          entry.isEnRoute &&
          currentCount - lastCount >= entry.surgeThreshold
        ) {
          notifySurge(entry.officeName, lastCount, currentCount);
        }

        updateLastCount(officeId, currentCount);
      } catch (err) {
        console.error(`Watcher error for ${officeId}:`, err);
      }
    }
  }, 60000);
};

export const stopWatcher = (): void => {
  if (watcherInterval) {
    clearInterval(watcherInterval);
    watcherInterval = null;
  }
};