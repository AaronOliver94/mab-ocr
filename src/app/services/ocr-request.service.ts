import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { catchError, map, switchMap, delay } from 'rxjs/operators';
import { Observable} from 'rxjs';
import { ComputerVisionResponse, RecognitionResult } from '../models/computer-vision-response.model';


@Injectable({
  providedIn: 'root'
})
export class OcrRequestService {

  constructor(private http: HttpClient) {}

  public async postOCRRequest(fileContent: string | ArrayBuffer): Promise<RecognitionResult> {
    const operationLocation: string = await this.submitForProcessing(fileContent);
    return await this.getResults(operationLocation);
  }

  private submitForProcessing(fileContent: string | ArrayBuffer): Promise<string> {
    const uri = 'https://northeurope.api.cognitive.microsoft.com/vision/v2.0/recognizeText';

    return new Promise ((resolve, reject) => {
      this.http.post(uri, fileContent, {
        headers: new HttpHeaders({
          'Content-Type': 'application/octet-stream',
          'Ocp-Apim-Subscription-Key' : '5816fb0edf074824b8d3bb1548bef0b9',
        }),
        observe: 'response',
        params: {
          'mode': 'Handwritten'
        }
      })
      .subscribe(
        (res: HttpResponse<Object>) => {
          const keys = res.headers.keys();
          const headers = keys.map(key => `${key}: ${res.headers.get(key)}`);

          if (res.status === 202) {
            resolve(headers.find((element: string) => element.startsWith('Operation-Location')).split('Operation-Location: ')[1]);
          } else {
            reject(new Error(`Failed to submit for processing. Request returned this status code: ${res.status}`));
          }
        },
        err => reject(this.errorHandler(err)));
    });
  }

  private getResults(operationLocation: string): Promise<RecognitionResult> {
    return new Promise(
      (resolve, reject) => {
        setTimeout(() => {
          this.http.get(operationLocation, {
            headers: new HttpHeaders({'Ocp-Apim-Subscription-Key' : '5816fb0edf074824b8d3bb1548bef0b9',
            'Accept': 'application/json', 'Content-Type': 'application/json'})
          }).subscribe(
            (res: ComputerVisionResponse) => {
              if (res.status === 'Succeeded') {
                const recognitionResult: RecognitionResult = res.recognitionResult;
                resolve(recognitionResult);
              } else {
                reject(new Error(`The OCR service failed to read the image, it returned this status: ${res.status}`));
              }
            },
            err => reject(this.errorHandler(err)));
        }, 10000);
    });
  }

  private errorHandler(error: Observable<Error>): Observable<Error> {
    throw new Error(`An error has occurred when calling out to the OCR service. Received this error: ${error}`);
  }
}
