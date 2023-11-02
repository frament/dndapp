import {DataBaseService} from "./data-base.service";
import {UserService} from "./auth/user.service";

export function initServicesFactory(
  databaseService: DataBaseService,
  userService: UserService,
) {
  return async () => {
    await databaseService.init();
    await userService.auth();
  };
}
