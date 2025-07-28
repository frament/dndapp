import {DataBaseService} from "./data-base.service";
import {UserService} from "./user.service";
import {FileService} from "./file.service";

export function initServicesFactory(
  databaseService: DataBaseService,
  userService: UserService,
  fileStoreService: FileService
) {
  return async () => {
    await databaseService.init();
    await userService.auth();
    await fileStoreService.init();
  };
}
