export class BaseNode implements IBaseNode {
  constructor(input?: Partial<BaseNode>) {
    if (input){ Object.assign(this, input); }
  }
  type:string = '';
  name: string = '';
  id: string = '';
  scale: number = 1;
  positionX: number = 50;
  positionY: number = 50;
  rotate: number = 0;
  color: string = '#FFFFFF';
  rx: number = 10;
  ry: number = 10;
}

export type IBaseNode = {
  id: string;
  scale:number;
  positionX: number;
  positionY: number;
  rotate: number;
  color: string;
  rx: number;
  ry: number;
  type: string;
  name: string;
}
