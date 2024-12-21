// Create debug functions with color coding
export const debugDB = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`%c[DB] ${message}`, 'color: #00a8e8; font-weight: bold;', ...args);
  }
};

export const debugAPI = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`%c[API] ${message}`, 'color: #7cb342; font-weight: bold;', ...args);
  }
};

export const debugJobs = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`%c[JOBS] ${message}`, 'color: #ffa000; font-weight: bold;', ...args);
  }
};

export const debugCache = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`%c[CACHE] ${message}`, 'color: #e64a19; font-weight: bold;', ...args);
  }
};