import { Component } from '@angular/core';
import { OcrRequestService } from './services/ocr-request.service';
import { NgForm } from '@angular/forms';
import { RecognitionResult } from './models/computer-vision-response.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private fileContent: string | ArrayBuffer;
  private imgUrl: string;
  private recognisedText: string;

/**
 * @constructor
 * @param {OcrRequestService} ocrRequestService - A service that handles callouts to OCR services
 */
  constructor(private ocrRequestService: OcrRequestService) {}

/**
 * A listener function that handles a users file input.
 * @param {FileList} files - The list of files that is retrieved from the input field
 */
  private handleFileInput(files: FileList): void {
    const file = files.item(0);

    this.getFileContent(file);
    this.getImageUrl(file);
  }

/**
 * A function that is called once a user clicks the submit button and wants to perform OCR.
 * @param {NgForm} form - Used to validate a form upon submission.
 */
  private onSubmit(form: NgForm): void {
    if (!form.valid) {
      return;
    }

    this.ocrRequestService.postOCRRequest(this.fileContent)
    .then((res: RecognitionResult) => {
      const lineArr = res.lines.map(line => line.text);
      this.recognisedText = lineArr.join(' ');
      this.ocrRequestService.postTextForAnalysis(this.recognisedText);
    });
  }

  private getImageUrl(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      this.imgUrl = reader.result.toString();
    };
  }

  private getFileContent(file) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onloadend = () => {
      this.fileContent = reader.result;
    };
  }
}
