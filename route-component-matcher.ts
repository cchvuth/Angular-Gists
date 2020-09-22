import { UrlMatchResult } from '@angular/router';

export class RouteComponentMatcher {
  constructor(private components = {}) {}

  swapIfMatch = (segs, groups, route): UrlMatchResult => {
    const matched = this.components[groups.segments[1]?.path];
    if (matched) {
      route.component = matched;
    }
    return {
      consumed: segs,
    };
  };
}
