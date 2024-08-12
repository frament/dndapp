export class NodeLayer implements INodeLayer {
  constructor(input?: Partial<NodeLayer>) {
    if (input){ Object.assign(this, input); }
  }
  isSelected: boolean = false;
  shadowFilter: string = 'url(#shadow)';
  id: string = '';
  width: number = 100;
  height: number = 100;
  positionX: number = 50;
  positionY: number = 50;
  rotate: number = 0;
  color: string = 'white';
  rx: number = 10;
  ry: number = 10;
}

export type INodeLayer = {
  isSelected: boolean;
  shadowFilter: string;
} & BaseNode;

export type BaseNode = {
  id: string;
  width: number;
  height: number;
  positionX: number;
  positionY: number;
  rotate: number;
  color: string;
  rx: number;
  ry: number;
}
