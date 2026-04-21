import { WatchEntry, WatchOptions, Watchlist } from '../types';

const KEY = 'qjan_watchlist';

export const getWatchlist = (): Watchlist => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as Watchlist;
  } catch {
    return {};
  }
};

export const addToWatchlist = (
  officeId: string,
  officeName: string,
  options: WatchOptions
): void => {
  const list = getWatchlist();
  const entry: WatchEntry = {
    officeName,
    quietThreshold: options.quietThreshold,
    surgeThreshold: options.surgeThreshold,
    isEnRoute: options.isEnRoute,
    lastCount: null,
    addedAt: Date.now(),
  };
  list[officeId] = entry;
  localStorage.setItem(KEY, JSON.stringify(list));
};

export const removeFromWatchlist = (officeId: string): void => {
  const list = getWatchlist();
  delete list[officeId];
  localStorage.setItem(KEY, JSON.stringify(list));
};

export const isWatched = (officeId: string): boolean => {
  return !!getWatchlist()[officeId];
};

export const updateLastCount = (officeId: string, count: number): void => {
  const list = getWatchlist();
  if (list[officeId]) {
    list[officeId].lastCount = count;
    localStorage.setItem(KEY, JSON.stringify(list));
  }
};

export const setEnRoute = (officeId: string, status: boolean): void => {
  const list = getWatchlist();
  if (list[officeId]) {
    list[officeId].isEnRoute = status;
    localStorage.setItem(KEY, JSON.stringify(list));
  }
};