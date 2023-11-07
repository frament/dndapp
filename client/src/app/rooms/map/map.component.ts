import {Component, ElementRef, HostListener, Input, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {NodeLayer} from "./node";
import {Point} from "./point";

@Component({
  selector: 'dndapp-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent {
  @Input() roomId:string = '';
  @ViewChild('svgGrid', { read: ElementRef }) svgGrid!: ElementRef<SVGSVGElement>;
  gridMaxWidth: number = 500;
  gridMaxHeight: number = 500;

  isDraggingGrid = false;
  gridDownClientX!: number;
  gridDownClientY!: number;
  scaleFactor = 1.02;

  // Node
  isDraggingNodeLayer = false;
  draggingNodeLayer: NodeLayer|undefined;
  nodeLayers: NodeLayer[] = [];
  selectedNodeLayers: NodeLayer[] = [];

  round(v:number):number {
    return Math.round(v / 10) * 10;
  }

  @HostListener( 'document:pointerup', [ '$event' ] )
  public upHandle(event: PointerEvent) {
    this.isDraggingGrid = false;
    this.isDraggingNodeLayer = false;
    this.draggingNodeLayer = undefined;
  }

  @HostListener('document:keyup', ['$event'])
  public handleKeyboardEvent(keyboardEvent: KeyboardEvent) {
    keyboardEvent.preventDefault();
    if (keyboardEvent.keyCode === 8 || keyboardEvent.keyCode === 46) {
      if (this.selectedNodeLayers.length > 0){
        this.nodeLayers = this.nodeLayers.filter(nodeLayer => !nodeLayer.isSelected);
      }
    }
  }

  @HostListener( 'document:pointermove', [ '$event' ] )
  public moveHandle(pointerEvent: PointerEvent){
    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();

    if (!this.isDraggingGrid && this.isDraggingNodeLayer) {
      const viewBoxList = this.svgGrid.nativeElement.getAttribute('viewBox')?.split(' ');
      if (!viewBoxList) return;
      const aspX = (parseInt(viewBoxList[2], 10) / this.gridMaxWidth);
      const aspY = (parseInt(viewBoxList[3], 10) / this.gridMaxHeight);
      if (!this.draggingNodeLayer) return;
      // move NodeLayer
      if (pointerEvent.offsetX) {
        this.draggingNodeLayer.positionX = this.round((pointerEvent.offsetX * aspX) + parseInt(viewBoxList[0], 10)) ;
        this.draggingNodeLayer.positionY = this.round((pointerEvent.offsetY * aspY) + parseInt(viewBoxList[1], 10)) ;
      } else {
        const { left, top } = (pointerEvent.srcElement as Element).getBoundingClientRect();
        this.draggingNodeLayer.positionX = pointerEvent.clientX - left + parseInt(viewBoxList[0], 10);
        this.draggingNodeLayer.positionY = pointerEvent.clientY - top + parseInt(viewBoxList[1], 10);
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Grid: Drag
  downHandleGrid(pointerEvent: PointerEvent) {
    if (!this.isDraggingNodeLayer) {
      this.isDraggingGrid = true;
      pointerEvent.preventDefault();
      this.gridDownClientX = pointerEvent.clientX;
      this.gridDownClientY = pointerEvent.clientY;
    }
  }

  moveHandleGrid(pointerEvent: PointerEvent){
    if (this.isDraggingGrid && !this.isDraggingNodeLayer) {
      pointerEvent.preventDefault();
      const delta: Point = {
        x: pointerEvent.clientX - this.gridDownClientX,
        y: pointerEvent.clientY - this.gridDownClientY
      };
      this.gridDownClientX = pointerEvent.clientX;
      this.gridDownClientY = pointerEvent.clientY;
      this.updateViewBoxMin(delta.x, delta.y);
    }
  }

  updateViewBoxMin(dx: number, dy: number): void {
    const viewBoxList = this.svgGrid?.nativeElement?.getAttribute('viewBox')?.split(' ');
    if (!viewBoxList) return;
    viewBoxList[0] = '' + this.cutoffDragRangeX(parseInt(viewBoxList[0], 10) - dx);
    viewBoxList[1] = '' + this.cutoffDragRangeY(parseInt(viewBoxList[1], 10) - dy);
    const viewBox = viewBoxList.join(' ');
    this.svgGrid.nativeElement.setAttribute('viewBox', viewBox);
  }

  cutoffDragRangeX(draggingPoint: number): number{
    if (draggingPoint < 0) {
      return 0;
    } else if (draggingPoint > (this.gridMaxWidth+1)) {
      return this.gridMaxWidth + 1;
    }
    return draggingPoint;
  }

  cutoffDragRangeY(draggingPoint: number): number{
    if (draggingPoint < 0) {
      return 0;
    } else if (draggingPoint > (this.gridMaxHeight +1)) {
      return this.gridMaxHeight+1;
    }
    return draggingPoint;
  }

  clickHandleGrid(pointerEvent: MouseEvent) {
    pointerEvent.preventDefault();
    if (this.selectedNodeLayers.length > 0){
      this.selectedNodeLayers.forEach((selectedNodeLayer: NodeLayer) => {
        selectedNodeLayer.isSelected = false;
        selectedNodeLayer.shadowFilter = 'url(#shadow)';
      });
      this.selectedNodeLayers = [];
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Grid: Zoom / Pan
  wheelHandleGrid(wheelEvent: WheelEvent){
    wheelEvent.preventDefault();
    const position = this.getEventPosition(wheelEvent);
    const scale = Math.pow(this.scaleFactor, wheelEvent.deltaY < 0 ? 1 : -1);
    this.zoomAtPoint(position, this.svgGrid.nativeElement, scale);
  }

  zoomInButton(){
    this.zoomAtPoint({x:50,y:50}, this.svgGrid.nativeElement, -1);
  }

  zoomOutButton(){
    this.zoomAtPoint({x:50,y:50}, this.svgGrid.nativeElement, 1);
  }

  getEventPosition(wheel: WheelEvent): Point {
    const point: Point = {x: 0, y: 0};
    if (wheel.offsetX) {
      point.x = wheel.offsetX;
      point.y = wheel.offsetY;
    } else {
      const { left, top } = (wheel.srcElement as Element ).getBoundingClientRect();
      point.x = wheel.clientX - left;
      point.y = wheel.clientY - top;
    }
    return point;
  }

  zoomAtPoint(point: Point, svg: SVGSVGElement, scale: number): void {
    const sx = point.x / svg.clientWidth;
    const sy = point.y / svg.clientHeight;
    if (!svg.getAttribute('viewBox')) return;
    const [minX, minY, width, height] = (svg.getAttribute('viewBox')??'').split(' ').map(s => parseFloat(s));
    const x = minX + width * sx;
    const y = minY + height * sy;
    const scaledMinX = this.cutoffScaledMin(x + scale * (minX - x));
    const scaledMinY = this.cutoffScaledMin(y + scale * (minY - y));
    const scaledWidth = this.cutoffScaledLength(width * scale);
    const scaledHeight = this.cutoffScaledHeight(height * scale);
    const scaledViewBox = [scaledMinX, scaledMinY, scaledWidth, scaledHeight]
      .map(s => s.toFixed(2))
      .join(' ');
    svg.setAttribute('viewBox', scaledViewBox);
  }
  // zoomAtPoint
  cutoffScaledMin(scaledMin: number): number{
    return scaledMin >= 0 ? scaledMin : 0;
  }
  cutoffScaledLength(length: number): number{
    return length <= 750 ? length : 750;
  }
  cutoffScaledHeight(length: number): number{
    return length <= 750 ? length : 750;
  }

  //////////////////////////////////////////////////////////////////////////////
  // NodeLayer
  downHandleNodeLayer(pointerEvent: PointerEvent, nodeLayer: NodeLayer) {
    this.isDraggingGrid = false;
    this.isDraggingNodeLayer = true;
    this.draggingNodeLayer = nodeLayer;
    pointerEvent.preventDefault();
  }

  clickHandleNodeLayer(pointerEvent: MouseEvent, nodeLayer: NodeLayer) {
    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();

    if (!pointerEvent.shiftKey) {
      if (this.selectedNodeLayers.length > 0){
        this.selectedNodeLayers.forEach((selectedSVGLayer: NodeLayer) => {
          selectedSVGLayer.isSelected = false;
          selectedSVGLayer.shadowFilter = 'url(#shadow)';
        });
        this.selectedNodeLayers = [];
      }
    }

    nodeLayer.isSelected = true;
    nodeLayer.shadowFilter = 'url(#liftedShadow)';
    this.selectedNodeLayers.push(nodeLayer);
  }

  //////////////////////////////////////////////////////////////////////////////
  // Button
  addNodeLayer() {
    const randomColor = ['white'];
    const w = 100;
    const h = 100;
    const pX = 50;
    const pY = 50;

    const newNodeLayer: NodeLayer = {
      id: 'node'+this.nodeLayers.length,
      width: w,
      height: h,
      positionX: pX,
      positionY: pY,
      rotate: 0,
      color: randomColor[ Math.floor( Math.random() * randomColor.length ) ],
      rx: 10,
      ry: 10,
      isSelected: false,
      shadowFilter: 'url(#shadow)'
    }
    this.nodeLayers.push(newNodeLayer);
  }
}
