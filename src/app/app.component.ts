import { Component } from '@angular/core';
import {NgForm} from '@angular/forms';
import { FileUploadService } from './services/file-upload.service';
import { OcrRequestService } from './services/ocr-request.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private fileContent: string | ArrayBuffer;

/**
 * @constructor
 * @param {FileUploadService} fileUploadService - The service that provides file oriented helper methods
 * @param {OcrRequestService} ocrRequestService - The service that handles callouts to OCR services
 */
  constructor(private fileUploadService: FileUploadService, private ocrRequestService: OcrRequestService) {}

/**
 * A function that is called once a user clicks the submit button and wants to perform OCR.
 */
  private onSubmit(): void {
  }



/**
 * A listener function that handles a users file input.
 * @param {FileList} files - The list of files that is retrieved from the input field
 */
  private handleFileInput(files: FileList) {
    this.fileContent = this.fileUploadService.convertToByteArray(files.item(0));
  }
}
