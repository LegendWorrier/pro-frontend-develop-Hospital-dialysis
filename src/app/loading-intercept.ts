import { CanMatchFn, Route, Router, UrlSegment } from "@angular/router";
import { inject } from "@angular/core";

export const LoadingIntercept: CanMatchFn =
(route: Route, segments: UrlSegment[]) => {
    //console.log(`check from [${window.location.pathname}] bypass:`, LoadingPage.Bypass)
    if (Loading.Bypass) {
        return true;
    }
    const router = inject(Router);
    console.log('infer to loading page');
    return router.createUrlTree(['loading'], { queryParams: { url: window.location.pathname } });
};

export namespace Loading {
    export let Bypass = false;
}