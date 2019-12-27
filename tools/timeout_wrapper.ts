type AnyAsyncFunc = (...args: any[]) => Promise<any>;
type NullableTimeout = NodeJS.Timeout | null;

const awaitWithTimeout = (timeoutInMS: number): [Promise<null>, () => void] => {
  let wait: NullableTimeout = null;

  const timeout = new Promise<null>(resolve => {
    wait = setTimeout(() => {
      clearTimeout(wait as NodeJS.Timeout);
      resolve(null);
    }, timeoutInMS);
  });

  const cancel = () => clearTimeout(wait as NodeJS.Timeout);

  return [timeout, cancel];
};

/**
 * The timeout wrapper takes any asynchronous function and wraps it, creating a new asynchronous function
 * with the same signature. This new function will resolve with `null` if the input function doesn't resolve
 * within the passed timout.
 *
 * @param cb - Any function that returns a promise
 * @param timeoutVal - Time in milliseconds to wait for the passed callback
 */
export const timeoutWrapper = <T extends AnyAsyncFunc>(cb: T, timeoutVal = 1000): T => {
  const [timeout, cancel] = awaitWithTimeout(timeoutVal);

  const wrappedFunction = async (...args: any[]) => {
    const output = await Promise.race([
      cb(...args),
      timeout
    ]);

    if (output !== null) {
      cancel();
    }

    return output;
  };

  return wrappedFunction as T;
};
