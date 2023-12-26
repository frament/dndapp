import {Point} from "../point";

export type IMaxDimensions = IMaxDimensionsScale & IMaxDimensionsBorders;
export type IMaxDimensionsScale = { scale: number; scaleLeader: 'height'|'width' };
export type IMaxDimensionsBorders = { minWidthBorder: number;  minHeightBorder: number; };

export class ScaleHelper {
  static updateMaxDimansions(host: HTMLElement, currentScale:number, img?:HTMLImageElement): IMaxDimensions {
    return {...this.updateMaxScale(host, img), ... this.updateMinBorders(host, currentScale, img)};
  }

  static updateMaxScale(host: HTMLElement, img?:HTMLImageElement): IMaxDimensionsScale {
    const result: IMaxDimensionsScale = {scaleLeader:'height', scale:8};
    if (img){
      result.scaleLeader =
        (img.width / host.clientWidth) < (img.height / host.clientHeight)
          ? 'width' : 'height';
      result.scale = result.scaleLeader === 'height'
        ? img.height / host.clientHeight
        : img.width  / host.clientWidth;
    } else {
      result.scaleLeader = host.clientWidth < host.clientHeight
        ? 'width' : 'height';
      result.scale = 8;
    }
    return result;
  }

  static updateMinBorders(host: HTMLElement, currentScale:number, img?:HTMLImageElement): IMaxDimensionsBorders {
    const result: IMaxDimensionsBorders = {minWidthBorder:1000, minHeightBorder:1000};
    if (img){
      result.minWidthBorder  =
        img.width  - host.clientWidth * currentScale;
      result.minHeightBorder =
        img.height - host.clientHeight * currentScale;
    } else {
      result.minWidthBorder  =
        (host.clientWidth * 8) - host.clientWidth * currentScale;
      result.minHeightBorder =
        (host.clientHeight * 8) - host.clientHeight * currentScale;
    }
    return result;
  }

  static cutoffScaledMinWidth(scaledMin: number, scale:number, maxDimensions: IMaxDimensions, img?:HTMLImageElement): number {
    if (scaledMin < 0) { return 0; }
    if (!img){ return scaledMin; }
    if (maxDimensions.scaleLeader === 'width' && scale >= maxDimensions.scale){ return 0; }
    return maxDimensions.minWidthBorder > scaledMin ? scaledMin : maxDimensions.minWidthBorder;
  }

  static cutoffScaledMinHeight(scaledMin: number, scale:number, maxDimensions: IMaxDimensions, img?:HTMLImageElement): number{
    if (scaledMin < 0) { return 0; }
    if (!img){ return scaledMin; }
    if (maxDimensions.scaleLeader === 'height' && scale >= maxDimensions.scale){ return 0; }
    return maxDimensions.minHeightBorder > scaledMin ? scaledMin : maxDimensions.minHeightBorder;
  }

  static cutoffMaxScale(scale:number, maxDimensions: IMaxDimensions, img?:HTMLImageElement): number {
    if (scale <= 0) { return 1; }
    if (!img) { return scale; }
    return scale > maxDimensions.scale ? maxDimensions.scale : scale;
  }

  static cutoffScaledWidth(width: number, img?:HTMLImageElement): number{
    if (width < 0) { return 0; }
    if (!img){ return width; }
    return img.width - width >= 0 ? width : img.width;
  }

  static cutoffScaledHeight(height: number, img?:HTMLImageElement): number{
    if (height < 0) { return 0; }
    if (!img){ return height; }
    return img.height - height >= 0 ? height : img.height;
  }

  static zoomViewBoxAtPoint(viewBox:string, point: Point, svg:SVGSVGElement, scale:number, maxDimensions: IMaxDimensions, img?:HTMLImageElement): string {
    if (!viewBox) {return viewBox; }
    const sx = point.x / svg.clientWidth;
    const sy = point.y / svg.clientHeight;
    const [minX, minY, width, height] = viewBox.split(' ').map(s => parseFloat(s));
    const x = minX + width * sx;
    const y = minY + height * sy;
    const scaledWidth = this.cutoffScaledWidth(width * scale, img);
    const scaledHeight = this.cutoffScaledHeight(height * scale, img);
    const scaledMinX = this.cutoffScaledMinWidth(x + scale * (minX - x), scale, maxDimensions, img);
    const scaledMinY = this.cutoffScaledMinHeight(y + scale * (minY - y), scale, maxDimensions, img);
    return [scaledMinX, scaledMinY, scaledWidth, scaledHeight]
      .map(s => s.toFixed(2))
      .join(' ');
  }
}
