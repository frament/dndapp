import {
  AfterViewInit,
  ChangeDetectorRef,
  Component, computed, effect,
  ElementRef,
  HostListener, inject, input,
  signal, viewChild,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {IBaseNode} from "./node";
import {Point} from "./point";
import {WidthHeight} from "./width-height";
import {FileService} from "../../services/file.service";
import {IMaxDimensions, ScaleHelper} from "./svg-helpers/scale-helper";
import {RoomService} from "../room.service";
import {SceneService} from "../scene/scene.service";
import {MapZoomComponent, ZoomValue} from "./map-components/zoom/MapZoom.component";
import {MapScenesComponent} from "./map-components/scenes/MapScenes.component";
import {delayedTask} from "../../helpers/delayed-task";

type MapModes = 'navigate'|'move_items';

@Component({
  selector: 'dndapp-map',
  standalone: true,
  imports: [CommonModule, MapZoomComponent, MapScenesComponent],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit{
  constructor() {
    effect(async () => {
      if (!this.roomService.currentRoom() || !this.sceneService.currentScene()){ return; }
      const fileName = this.sceneService.getSceneBackgroundFileName(
        this.roomService.currentRoom()?.id as string,
        this.sceneService.currentScene()?.id as string
      );
      await this.setBgImage(fileName);
    });
  }
  roomId = input.required<string>(); // id комнаты приходит из вне
  bgImage = viewChild<any>('bgImage'); // бэкграунд
  roomService = inject(RoomService);
  sceneService = inject(SceneService);
  files = inject(FileService)
  private changeDetectorRef = inject(ChangeDetectorRef)
  private hostRef = inject(ElementRef);
  selectedNode = signal<IBaseNode|undefined>(undefined);

  gridCubeDimension = computed<number>(() => this.sceneService.currentScene()?.gridStepWidth ?? 100); // масштаб сетки - большая часть
  gridMiniCubeBimension = computed<number>(() => Math.floor(this.gridCubeDimension() / 10)); // масштаб сетки - мелкая часть

  mode = signal<MapModes>('navigate'); // ???

  img: HTMLImageElement|undefined;

  async setBgImage(fileName:string){
    const file = await this.files.getFile(fileName);
    if (!file) { return; }
    const img = await this.files.getImageFromFile(file);
    this.bgImage().nativeElement.setAttribute('width', img.width);
    this.bgImage().nativeElement.setAttribute('height',img.height);
    this.bgImage().nativeElement.setAttribute('href', URL.createObjectURL(file));
    this.setGridWH(this.svgGrid.nativeElement);
    this.img = img;
    this.updateMaxDimensions();
  }

  svgGrid!:ElementRef<SVGSVGElement>;
  @ViewChild('svgGrid', { read: ElementRef })
  set childSelector(val: ElementRef<SVGSVGElement>) {
    this.svgGrid = val;
    val.nativeElement.setAttribute('viewBox', '0 0 ' + val.nativeElement.clientWidth+' '+val.nativeElement.clientHeight);
    this.setGridWH(val.nativeElement);
    this.changeDetectorRef.detectChanges();
  }

  @HostListener('window:resize', ['$event'])
  resize(){
    delayedTask(() => this.updateMaxDimensions(), 100, 'lastResizeEvent');
  }

  ngAfterViewInit(): void {
    this.updateMaxDimensions();
  }

  gridWH = signal<WidthHeight>({ width: 500, height: 500 });
  maxDimensions: IMaxDimensions  = {
    scale: 8,
    scaleLeader: 'height',
    minWidthBorder: 1000,
    minHeightBorder: 1000,
  };

  updateMaxDimensions():void {
    this.maxDimensions = ScaleHelper.updateMaxDimansions(this.hostRef.nativeElement, this.scale, this.img);
  }

  scale = 1;
  isDraggingGrid = false;
  gridDownClientX!: number;
  gridDownClientY!: number;
  scaleFactor = 1.02;

  // Node
  isDraggingNodeLayer = false;
  draggingNodeLayer: IBaseNode|undefined;

  setGridWH(svg:SVGSVGElement){
    const viewBoxList = (svg ?? this.svgGrid?.nativeElement)?.getAttribute('viewBox')?.split(' ');
    if (!viewBoxList) return;
    const newWith = this.img?.width ?? parseFloat(Math.abs(parseInt(viewBoxList[0], 10) + parseInt(viewBoxList[2], 10)).toFixed(2));
    if (newWith > this.gridWH().width) this.gridWH.update(x => ({...x, width:newWith}));
    const newHeight = this.img?.height ?? parseFloat(Math.abs(parseInt(viewBoxList[1], 10) + parseInt(viewBoxList[3], 10)).toFixed(2));
    if (newHeight > this.gridWH().height) this.gridWH.update(x => ({...x, height:newHeight}));
  }

  @HostListener( 'document:pointerup', [ '$event' ] )
  public upHandle() {
    this.isDraggingGrid = false;
    this.isDraggingNodeLayer = false;
    this.draggingNodeLayer = undefined;
  }

  @HostListener('document:keyup', ['$event'])
  public async handleKeyboardEvent(keyboardEvent: KeyboardEvent) {
    keyboardEvent.preventDefault();
    // if (keyboardEvent.keyCode === 8 || keyboardEvent.keyCode === 46 ){
    if (keyboardEvent.code === 'Backspace' || keyboardEvent.code === 'Delete') {
      if (this.selectedNode()){
        await this.sceneService.deleteNode(this.selectedNode()?.id as string);
      }
    }
  }

  roundVScale(value:number, scale:number):number{
    return Math.round(value / scale) * scale;
  }

  @HostListener( 'document:pointermove', [ '$event' ] )
  public async moveHandle(pointerEvent: PointerEvent){
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
        this.draggingNodeLayer.positionX = this.roundVScale((pointerEvent.offsetX * aspX) + parseInt(viewBoxList[0], 10), this.gridCubeDimension() / 2);
        this.draggingNodeLayer.positionY = this.roundVScale((pointerEvent.offsetY * aspY) + parseInt(viewBoxList[1], 10), this.gridCubeDimension() / 2);
      } else {
        const { left, top } = (pointerEvent.target as Element).getBoundingClientRect();
        this.draggingNodeLayer.positionX = pointerEvent.clientX - left + parseInt(viewBoxList[0], 10);
        this.draggingNodeLayer.positionY = pointerEvent.clientY - top + parseInt(viewBoxList[1], 10);
      }
      const nodeUpdate = {
        id: this.draggingNodeLayer.id,
        positionX: this.draggingNodeLayer.positionX,
        positionY: this.draggingNodeLayer.positionY,
      }
      delayedTask(async () => {
        await this.sceneService.updateNode(nodeUpdate);
      }, 300, 'nodeMove');
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
    if (this.selectedNode()){
      this.selectedNode.set(undefined);
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
    this.updateMaxDimensions();
    const scaledViewBox = ScaleHelper.zoomViewBoxAtPoint(svg.getAttribute('viewBox')??'', point, svg, scale, this.maxDimensions, this.img);
    svg.setAttribute('viewBox', scaledViewBox);
    this.setGridWH(svg);
  }

  //////////////////////////////////////////////////////////////////////////////
  // NodeLayer
  downHandleNodeLayer(pointerEvent: PointerEvent, nodeLayer: IBaseNode) {
    this.isDraggingGrid = false;
    this.isDraggingNodeLayer = true;
    this.draggingNodeLayer = nodeLayer;
    pointerEvent.preventDefault();
    this.sceneService.currentNode.set(this.sceneService.sceneNodes().find(x => x.id === nodeLayer.id));
    this.sceneService.rightMode.set('scene-items');
  }

  clickHandleNodeLayer(pointerEvent: MouseEvent, nodeLayer: IBaseNode) {
    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();
    this.selectedNode.set(nodeLayer);
  }
}
