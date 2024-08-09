import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {UserService} from "../services/user.service";

export const authGuard: CanActivateFn = async () : Promise<boolean> => {
  const service = inject(UserService);
  const router = inject(Router);
  if (service.user) return true;
  const result = await service.auth();
  if (!result) {
    await router.navigateByUrl('/auth');
  }
  return result;
};
