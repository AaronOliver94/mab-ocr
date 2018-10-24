import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, switchMap, delay } from 'rxjs/operators';
import { Observable} from 'rxjs';
import { ComputerVisionResponse, RecognitionResult } from '../models/computer-vision-response.model';


@Injectable({
  providedIn: 'root'
})
export class OcrRequestService {

  constructor(private http: HttpClient) {}

  public async postOCRRequest(fileContent: string | ArrayBuffer): Promise<ComputerVisionResponse> {
    const operationLocation: string = await this.submitForProcessing(fileContent);
    const result: ComputerVisionResponse = await this.getResults(operationLocation);
    return result;
  }

  private submitForProcessing(fileContent: string | ArrayBuffer): Promise<string> {
    console.log('submit for processing');
    const httpOptions = this.buildHttpOptions();
    const uri = 'https://northeurope.api.cognitive.microsoft.com/vision/v2.0/recognizeText';

    return new Promise ((resolve, reject) => {
      this.http.post(uri, fileContent, httpOptions)
      .subscribe(
        (res: Response) => {
          if (res.status >= 200 && res.status < 300) {
            resolve(res.headers['Operation-Location']);
          } else {
            reject(new Error(`Failed to submit for processing. Request returned this status code: ${res.status}`));
          }
        },
        err => reject(this.errorHandler(err)));
    });
  }

  private getResults(operationLocation: string): Promise<any> {
    console.log('get results');
    return new Promise ((resolve, reject) => {
      this.http.get(operationLocation)
      .pipe(
        map((res: Response) => res.json())
      ).subscribe((res) => resolve(res),
        err => reject(this.errorHandler(err)));
    });
  }

  private buildHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key' : '5816fb0edf074824b8d3bb1548bef0b9'
      }),
      params: {
        'mode': 'Handwritten'
      }
    };
  }

  private errorHandler(error: Observable<Error>): Observable<Error> {
    throw new Error(`An error has occurred when calling out to the OCR service. Received this error: ${error}`);
  }
}
