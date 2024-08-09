export type NodeLayer = {
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
