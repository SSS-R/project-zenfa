
// Simple in-memory cache for components
const cache: { [key: string]: any } = {};

export const getCache = (key: string) => cache[key];
export const setCache = (key: string, data: any) => { cache[key] = data; };
