export type IRoom = {
  id:string,
  name:string,
  admin:string,
  users:string[]
}

export class Room implements IRoom {
  id:string = '';
  name:string = '';
  admin:string = '';
  users:string[] = [];
}
