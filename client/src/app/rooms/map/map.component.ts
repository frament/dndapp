import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener, inject,
  Input,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {NodeLayer} from "./node";
import {Point} from "./point";
import {WidthHeight} from "./width-height";
import {FileService} from "../../files/file.service";

@Component({
  selector: 'dndapp-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit{
  constructor(private changeDetectorRef: ChangeDetectorRef, private hostRef: ElementRef) {}

  @Input() roomId:string = '';
  @ViewChild('bgImage') bgImage!: any;


  files = inject(FileService)

  img: HTMLImageElement|undefined;


  async setBgImage(){
    const list = await this.files.getFileList();
    const file = await this.files.getFile(list[0]);
    const img = await this.files.getImageFormFile(file);
    this.bgImage.nativeElement.setAttribute('width', img.width);
    this.bgImage.nativeElement.setAttribute('height',img.height);
    this.bgImage.nativeElement.setAttribute('href', URL.createObjectURL(file));
    this.setGridWH(this.svgGrid.nativeElement);
    this.img = img;
    this.updateMaxDimansions();
  }

  svgGrid!:ElementRef<SVGSVGElement>;
  @ViewChild('svgGrid', { read: ElementRef })
  set childSelector(val: ElementRef<SVGSVGElement>) {
    this.svgGrid = val;
    val.nativeElement.setAttribute('viewBox', '0 0 ' + val.nativeElement.clientWidth+' '+val.nativeElement.clientHeight);
    this.setGridWH(val.nativeElement);
    this.changeDetectorRef.detectChanges();
  }


  lastResizeEvent: number = 0;
  @HostListener('window:resize', ['$event'])
  resize(event:any){
    this.lastResizeEvent = new Date().getTime();
    setTimeout(() => {
      if (new Date().getTime() - this.lastResizeEvent > 99){
        this.updateMaxDimansions();
      }
    }, 100);
  }

  ngAfterViewInit(): void {
    this.updateMaxDimansions();
  }

  gridWH: WidthHeight = { width: 500, height: 500 };
  maxDimensions = {
    scale: 8,
    scaleLeader: 'height',
    minWidthBorder: 1000,
    minHeightBorder: 1000,
  };

  updateMaxDimansions():void {
    this.updateMaxScale();
    this.updateMinBorders();
  }

  updateMaxScale(): void {
    if (this.img){
      this.maxDimensions.scaleLeader =
        (this.img.width / this.hostRef.nativeElement.clientWidth) < (this.img.height / this.hostRef.nativeElement.clientHeight)
          ? 'width' : 'height';
      this.maxDimensions.scale = this.maxDimensions.scaleLeader === 'height'
        ? this.img.height / this.hostRef.nativeElement.clientHeight
        : this.img.width  / this.hostRef.nativeElement.clientWidth;
    } else {
      this.maxDimensions.scaleLeader = this.hostRef.nativeElement.clientWidth < this.hostRef.nativeElement.clientHeight
        ? 'width' : 'height';
      this.maxDimensions.scale = 8;
    }
  }

  updateMinBorders(): void {
    if (this.img){
      this.maxDimensions.minWidthBorder  =
        this.img.width  - this.hostRef.nativeElement.clientWidth * this.scale;
      this.maxDimensions.minHeightBorder =
        this.img.height - this.hostRef.nativeElement.clientHeight * this.scale;
    } else {
      this.maxDimensions.minWidthBorder  =
        (this.hostRef.nativeElement.clientWidth * 8) - this.hostRef.nativeElement.clientWidth * this.scale;
      this.maxDimensions.minHeightBorder =
        (this.hostRef.nativeElement.clientHeight * 8) - this.hostRef.nativeElement.clientHeight * this.scale;
    }
  }

  scale = 1;
  isDraggingGrid = false;
  gridDownClientX!: number;
  gridDownClientY!: number;
  scaleFactor = 1.02;

  // Node
  isDraggingNodeLayer = false;
  draggingNodeLayer: NodeLayer|undefined;
  nodeLayers: NodeLayer[] = [];
  selectedNodeLayers: NodeLayer[] = [];

  setGridWH(svg:SVGSVGElement){
    const viewBoxList = (svg ?? this.svgGrid?.nativeElement)?.getAttribute('viewBox')?.split(' ');
    if (!viewBoxList) return;
    const newWith = this.img?.width ?? parseFloat(Math.abs(parseInt(viewBoxList[0], 10) + parseInt(viewBoxList[2], 10)).toFixed(2));
    if (newWith > this.gridWH.width) this.gridWH.width = newWith;
    const newHeight = this.img?.height ?? parseFloat(Math.abs(parseInt(viewBoxList[1], 10) + parseInt(viewBoxList[3], 10)).toFixed(2));
    if (newHeight > this.gridWH.height) this.gridWH.height = newHeight;
  }

  @HostListener( 'document:pointerup', [ '$event' ] )
  public upHandle() {
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

  roundVScale(value:number, scale:number):number{
    return Math.round(value / scale) * scale;
  }

  @HostListener( 'document:pointermove', [ '$event' ] )
  public moveHandle(pointerEvent: PointerEvent){
    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();
    if (!this.isDraggingGrid && this.isDraggingNodeLayer) {
      const viewBoxList = this.svgGrid.nativeElement.getAttribute('viewBox')?.split(' ');
      if (!viewBoxList) return;
      const aspX = (parseInt(viewBoxList[2], 10) / this.svgGrid.nativeElement.clientWidth);
      const aspY = (parseInt(viewBoxList[3], 10) / this.svgGrid.nativeElement.clientHeight);
      if (!this.draggingNodeLayer) return;
      // move NodeLayer
      if (pointerEvent.offsetX) {
        this.draggingNodeLayer.positionX = this.roundVScale((pointerEvent.offsetX * aspX) + parseInt(viewBoxList[0], 10), 50) ;
        this.draggingNodeLayer.positionY = this.roundVScale((pointerEvent.offsetY * aspY) + parseInt(viewBoxList[1], 10), 50) ;
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
    const minWidth = parseInt(viewBoxList[0], 10) - dx * this.scale;
    const minHeight = parseInt(viewBoxList[1], 10) - dy * this.scale;
    viewBoxList[0] = '' + this.cutoffScaledMinWidth(minWidth);
    viewBoxList[1] = '' + this.cutoffScaledMinHeight(minHeight);
    const viewBox = viewBoxList.join(' ');
    this.svgGrid.nativeElement.setAttribute('viewBox', viewBox);
    this.setGridWH(this.svgGrid.nativeElement);
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

  getCenter(): Point {
    return {
      x: Math.round(this.svgGrid.nativeElement.clientWidth / 2),
      y: Math.round(this.svgGrid.nativeElement.clientHeight / 2),
    }
  }

  zoomInButton(){
    this.zoomAtPoint(this.getCenter(), this.svgGrid.nativeElement, 0.5);
  }

  zoomOutButton(){
    this.zoomAtPoint(this.getCenter(), this.svgGrid.nativeElement, 2);
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
    this.scale = this.cutoffMaxScale(this.scale * scale);
    this.updateMinBorders();
    const sx = point.x / svg.clientWidth;
    const sy = point.y / svg.clientHeight;
    if (!svg.getAttribute('viewBox')) return;
    const [minX, minY, width, height] = (svg.getAttribute('viewBox')??'').split(' ').map(s => parseFloat(s));
    const x = minX + width * sx;
    const y = minY + height * sy;
    let scaledWidth = this.cutoffScaledWidth(width * scale); // this.cutoffScaledLength(width * scale);
    let scaledHeight = this.cutoffScaledHeight(height * scale); // this.cutoffScaledHeight(height * scale);
    const scaledMinX = this.cutoffScaledMinWidth(x + scale * (minX - x));
    const scaledMinY = this.cutoffScaledMinHeight(y + scale * (minY - y));
    const scaledViewBox = [scaledMinX, scaledMinY, scaledWidth, scaledHeight]
      .map(s => s.toFixed(2))
      .join(' ');
    svg.setAttribute('viewBox', scaledViewBox);
    this.setGridWH(svg);
  }

  cutoffScaledMinWidth(scaledMin: number): number {
    if (scaledMin < 0) { return 0; }
    if (!this.img){ return scaledMin; }
    if (this.maxDimensions.scaleLeader === 'width' && this.scale >= this.maxDimensions.scale){ return 0; }
    return this.maxDimensions.minWidthBorder > scaledMin ? scaledMin : this.maxDimensions.minWidthBorder;
  }

  cutoffScaledMinHeight(scaledMin: number): number{
    if (scaledMin < 0) { return 0; }
    if (!this.img){ return scaledMin; }
    if (this.maxDimensions.scaleLeader === 'height' && this.scale >= this.maxDimensions.scale){ return 0; }
    return this.maxDimensions.minHeightBorder > scaledMin ? scaledMin : this.maxDimensions.minHeightBorder;
  }

  cutoffMaxScale(scale:number): number {
    if (scale <= 0) { return 1; }
    if (!this.img) { return scale; }
    return scale > this.maxDimensions.scale ? this.maxDimensions.scale : scale;
  }

  cutoffScaledWidth(width: number): number{
    if (width < 0) { return 0; }
    if (!this.img){ return width; }
    return this.img.width - width >= 0 ? width : this.img.width;
  }

  cutoffScaledHeight(height: number): number{
    if (height < 0) { return 0; }
    if (!this.img){ return height; }
    return this.img.height - height >= 0 ? height : this.img.height;
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
