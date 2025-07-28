import { Injectable } from '@angular/core';
export type FileOutType = 'DataURL'|'ArrayBuffer'|'BinaryString'|'Text';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  db!:IDBDatabase;

  async init():Promise<void>{
    const request = window.indexedDB.open('local_file_store', 1);
    request.addEventListener('error', () => console.error('Database failed to open'));
    request.addEventListener('success', () =>  this.db = request.result);
    request.addEventListener('upgradeneeded', (e:IDBVersionChangeEvent) =>
      (e.target as IDBOpenDBRequest)?.result
        .createObjectStore('files', { keyPath: 'name' })
    );
  }

  async getFileList(): Promise<string[]>{
    return new Promise<string[]>((resolve,reject) => {
      const request = this.db.transaction("files").objectStore("files").getAllKeys();
      request.addEventListener("success", () => resolve(request.result.map(x=>x.toString())));
      request.addEventListener('error', () => reject(request.error));
    })
  }

  async saveFile(name:string, data:File): Promise<void> {
    await this.deleteFile(name);
    return new Promise<void>((resolve, reject) => {
      const request = this.db.transaction(['files'], 'readwrite').objectStore('files').add({name,data});
      request.addEventListener('success', () => resolve());
      request.addEventListener('error', () => reject(request.error));
    })
  }

  resolveFile(file:File|Blob, outType:FileOutType): Promise<any>{
    return new Promise<any>( resolve => {
      if (file && outType){
        let reader = new FileReader();
        reader.addEventListener("load", () => resolve(reader.result), false);
        switch (outType) {
          case 'ArrayBuffer': reader.readAsArrayBuffer(file); break;
          case 'DataURL': reader.readAsDataURL(file); break;
          case 'BinaryString': reader.readAsBinaryString(file); break;
          case 'Text': reader.readAsText(file); break;
        }
      }else{
        resolve(null);
      }
    })
  }

  getImageFromFile(file:File|Blob): Promise<HTMLImageElement>{
    return new Promise<HTMLImageElement>( resolve => {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const img = new Image();
        img.src = reader.result as string;
        img.addEventListener('load', () => resolve(img));
      })
      reader.readAsDataURL(file);
    });

  }

  async getFile(name:string): Promise<File> {
    return new Promise<any>((resolve,reject) => {
      const request = this.db.transaction("files").objectStore("files").get(name);
      request.addEventListener("success", () => resolve(request.result?.data));
      request.addEventListener('error', () => reject(request.error));
    })
  }

  async getObjUrlForFile(name:string):Promise<string>{
    const file = await this.getFile(name);
    return file ? URL.createObjectURL(file) : '';
  }

  deleteFile(name:string):Promise<void> {
    return new Promise<void>((resolve,reject) => {
      const request = this.db.transaction(['files'], 'readwrite').objectStore("files").delete(name);
      request.addEventListener('success', () => resolve());
      request.addEventListener('error', () => reject(request.error));
    })
  }
}
