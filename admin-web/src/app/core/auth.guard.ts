import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { FirebaseService } from './firebase.service';

export const authGuard: CanActivateFn = async () => {
  const firebase = inject(FirebaseService);
  const router = inject(Router);

  const user = await firstValueFrom(
    firebase.authState().pipe(
      // ignore the initial undefined-ish emission until Firebase has resolved
      filter((u) => u !== undefined),
      take(1),
    ),
  );

  if (user) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
