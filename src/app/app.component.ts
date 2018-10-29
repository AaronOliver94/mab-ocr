import { Component } from '@angular/core';
import { FileUploadService } from './services/file-upload.service';
import { OcrRequestService } from './services/ocr-request.service';
import { NgForm } from '@angular/forms';
import { ComputerVisionResponse, RecognitionResult } from './models/computer-vision-response.model';
import { ConstantPool } from '@angular/compiler';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private fileContent: string | ArrayBuffer;
  private recognisedText: string;

/**
 * @constructor
 * @param {FileUploadService} fileUploadService - A service that provides file oriented helper methods
 * @param {OcrRequestService} ocrRequestService - A service that handles callouts to OCR services
 */
  constructor(private fileUploadService: FileUploadService, private ocrRequestService: OcrRequestService) {}

/**
 * A listener function that handles a users file input.
 * @param {FileList} files - The list of files that is retrieved from the input field
 */
  private handleFileInput(files: FileList) {
    const file = files.item(0);
    const reader = new FileReader();

    reader.onloadend = () => {
      this.fileContent = reader.result;
    };

    reader.readAsArrayBuffer(file);
  }


/**
 * A function that is called once a user clicks the submit button and wants to perform OCR.
 * @param {NgForm} form - Used to validate a form upon submittion.
 */
  private onSubmit(form: NgForm): void {
    if (!form.valid) {
      return;
    }

    this.ocrRequestService.postOCRRequest(this.fileContent)
    .then((res: RecognitionResult) => {
      const lineArr = res.lines.map(line => line.text);
      this.recognisedText = lineArr.join(' ');
    });
  }
}
