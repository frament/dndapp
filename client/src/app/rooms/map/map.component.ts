import {
  AfterViewInit,
  ChangeDetectorRef,
  Component, computed, effect,
  ElementRef,
  HostListener, inject,
  Input, signal,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {NodeLayer} from "./node";
import {Point} from "./point";
import {WidthHeight} from "./width-height";
import {FileService} from "../../services/file.service";
import {IMaxDimensions, ScaleHelper} from "./svg-helpers/scale-helper";
import {RoomService} from "../room.service";
import {SceneService} from "../scene/scene.service";
import {MapZoomComponent, ZoomValue} from "./map-components/zoom/MapZoom.component";
import {MapScenesComponent} from "./map-components/scenes/MapScenes.component";

type MapModes = 'navigate'|'move_items';

@Component({
  selector: 'dndapp-map',
  standalone: true,
  imports: [CommonModule, MapZoomComponent, MapScenesComponent],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit{
  constructor(private changeDetectorRef: ChangeDetectorRef, private hostRef: ElementRef) {
    effect(async () => {
      if (!this.roomService.currentRoom() || !this.sceneService.currentScene()){ return; }
      const fileName = this.sceneService.getSceneBackgroundFileName(
        this.roomService.currentRoom()?.id as string,
        this.sceneService.currentScene()?.id as string
      );
      console.log(fileName);
      await this.setBgImage(fileName);
    });
    effect(() => {
      this.nodeLayers  = this.sceneService.sceneNodes();
    });
  }

  @Input() roomId:string = '';
  @ViewChild('bgImage') bgImage!: any;

  roomService = inject(RoomService);
  sceneService = inject(SceneService);

  mode = signal<MapModes>('navigate');
  title = computed(() => this.sceneService.currentScene()?.name ?? '');

  files = inject(FileService)

  img: HTMLImageElement|undefined;


  async setBgImage(fileName:string){
    const file = await this.files.getFile(fileName);
    if (!file) { return; }
    const img = await this.files.getImageFromFile(file);
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
  resize(){
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
  maxDimensions: IMaxDimensions  = {
    scale: 8,
    scaleLeader: 'height',
    minWidthBorder: 1000,
    minHeightBorder: 1000,
  };

  updateMaxDimansions():void {
    this.maxDimensions = ScaleHelper.updateMaxDimansions(this.hostRef.nativeElement, this.scale, this.img);
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
    viewBoxList[0] = '' + ScaleHelper.cutoffScaledMinWidth(minWidth, this.scale, this.maxDimensions, this.img);
    viewBoxList[1] = '' + ScaleHelper.cutoffScaledMinHeight(minHeight, this.scale, this.maxDimensions, this.img);
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

  zoom(event:ZoomValue):void{
    switch (event) {
      case 'in': this.zoomAtPoint(this.getCenter(), this.svgGrid.nativeElement, 0.5); break;
      case 'out': this.zoomAtPoint(this.getCenter(), this.svgGrid.nativeElement, 2); break;
    }
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
    this.scale = ScaleHelper.cutoffMaxScale(this.scale * scale, this.maxDimensions, this.img);
    this.updateMaxDimansions();
    const scaledViewBox = ScaleHelper.zoomViewBoxAtPoint(svg.getAttribute('viewBox')??'', point, svg, scale, this.maxDimensions, this.img);
    svg.setAttribute('viewBox', scaledViewBox);
    this.setGridWH(svg);
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
