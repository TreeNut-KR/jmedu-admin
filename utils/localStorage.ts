export const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
    } else {
      console.error("localStorage: 알 수 없는 에러가 발생했습니다. (getItem)");
    }
    return defaultValue;
  }
};

export const setItem = <T>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
    } else {
      console.error("localStorage: 알 수 없는 에러가 발생했습니다. (setItem)");
    }
  }
};

export const removeItem = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
    } else {
      console.error("localStorage: 알 수 없는 에러가 발생했습니다. (removeItem)");
    }
  }
};
