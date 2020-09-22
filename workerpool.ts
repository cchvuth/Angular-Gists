import * as workerpool from 'workerpool';
import { Observable, EMPTY, from } from 'rxjs';
const pool = workerpool.pool();

function httpTransform(obs: Observable<any>, mapFn: (...t: any) => any, ...extra: any): Observable<any> {
  return typeof window === 'undefined'
    ? EMPTY
    : new Observable((sub) => {
        obs.subscribe((data) => {
          pool
            .exec(mapFn, [data, ...extra])
            .then((result) => {
              sub.next(result);
              sub.complete();
            })
            .catch((err) => {
              sub.error(err);
            });
        });
      });
}

function poolExec(fn: (...t: any) => any, params: any[]): Observable<any> {
  return typeof window === 'undefined' ? EMPTY : from(pool.exec(fn, params));
}

export { poolExec, httpTransform };
