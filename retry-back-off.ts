import { Observable, of, throwError } from 'rxjs';
import { retryWhen, mergeMap, delay } from 'rxjs/operators';

const DEFAULT_MAX = 5;
const DEFAULT_BACKOFF = 1000;

export function retryWithBackoff(delayMs: number, maxRetry = DEFAULT_MAX, backOffMs = DEFAULT_BACKOFF) {
  let retries = maxRetry;

  return (src: Observable<any>) =>
    src.pipe(
      retryWhen((errors: Observable<any>) =>
        errors.pipe(
          mergeMap(error => {
            if (retries-- > 0) {
              const backoffTime = delayMs + (maxRetry - retries) * backOffMs;
              return of(error).pipe(delay(backoffTime));
            }
            console.error(error);
            return throwError(maxRetry);
          })
        )
      )
    );
}
