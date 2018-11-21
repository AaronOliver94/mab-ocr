import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable} from 'rxjs';
import { ComputerVisionResponse, RecognitionResult } from '../models/computer-vision-response.model';


@Injectable({
  providedIn: 'root'
})
export class OcrRequestService {

  constructor(private http: HttpClient) {}
  /**
   * This method makes two calls out the the OCR API and then returns a promise with the results.
   * @param {string | ArrayBuffer} fileContent - The contents of the file that has been uploaded.
   * @returns {Promise<RecognitionResult>} - The results of the OCR service.
   */
  public async postOCRRequest(fileContent: string | ArrayBuffer): Promise<RecognitionResult> {
    const operationLocation: string = await this.submitForProcessing(fileContent);
    return await this.getResults(operationLocation);
  }

  /**
   * This method makes the first of two calls to Azure's OCR API. It posts the file content to
   * the service, which then returns the location of the result as a URL.
   * @param {string | ArrayBuffer} fileContent - The contents of the file that has been uploaded.
   * @returns {Promise<string>} - A url that is required by the second API call.
   */
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
          const headers = keys.map(key => `${key.toLowerCase()}: ${res.headers.get(key)}`);

          if (res.status === 202) {
            resolve(headers.find((element: string) => element.startsWith('operation-location')).split('operation-location: ')[1]);
          } else {
            reject(new Error(`Failed to submit for processing. Request returned this status code: ${res.status}`));
          }
        },
        err => reject(this.errorHandler(err)));
    });
  }

  /**
   * This is the second of the two calls to the OCR API. It uses the operation location that was
   * returned from the first call to retrieve the results.
   * @param {string} operationLocation - The location that the OCR service's results can be found.
   * @returns {Promise<RecognitionResult>} - An object containing the text that has been recognised.
   */
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
  /**
   *
   * @param {Observable<Error>} error - Any error returned by the callouts.
   * @returns {Observable<Error>} - returns
   */
  private errorHandler(error: Observable<Error>): Observable<Error> {
    throw new Error(`An error has occurred when calling out to the OCR service. Received this error: ${JSON.stringify(error)}`);
  }
}
