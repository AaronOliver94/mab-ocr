import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor() { }

  public convertToByteArray(file: File): string | ArrayBuffer {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    return reader.result;
  }
}
