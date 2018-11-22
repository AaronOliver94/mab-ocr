import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable} from 'rxjs';
import { ComputerVisionResponse, RecognitionResult } from '../models/computer-vision-response.model';
import { Document, CognitiveServicesResponse, KeyPhrasesResponse, SentimentResponse } from '../models/cognitive-services.model';


@Injectable({
  providedIn: 'root'
})
export class OcrRequestService {
  private documents = Array<Document>();
  readonly accessKey = '5816fb0edf074824b8d3bb1548bef0b9';

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

    return new Promise((resolve, reject) => {
      this.http.post(uri, fileContent, {
        headers: new HttpHeaders({
          'Content-Type': 'application/octet-stream',
          'Ocp-Apim-Subscription-Key' : this.accessKey,
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
        (err: Observable<Error>) => reject(this.errorHandler(err)));
    });
  }

  /**
   * This is the second of the two calls to the OCR API. It uses the operation location that was
   * returned from the first call to retrieve the results.
   * @param {string} operationLocation - The location that the OCR service's results can be found.
   * @returns {Promise<RecognitionResult>} - An object containing the text that has been recognised.
   */
  private getResults(operationLocation: string): Promise<RecognitionResult> {
    return new Promise((resolve, reject) => {
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
            (err: Observable<Error>) => reject(this.errorHandler(err)));
        }, 10000);
    });
  }

  public postTextForAnalysis(body: string): Array<Object> {
    this.marshalDocuments(body);
    const requests = ['keyPhrases', 'sentiment'];
    const promises = Array<Promise<Array<KeyPhrasesResponse | SentimentResponse>>>();
    const res = Array<Object>();

    requests.forEach(req => {
      promises.push(this.getTextAnalysis(this.documents, req));
    });

    Promise.all(promises)
    .then((results: Array<any>) => {
      for (let index = 0; index < results.length; index++) {
        const analysis: KeyPhrasesResponse | SentimentResponse = results[index];
        const service: string = results[index];
        res.push({service: analysis});
      }
    });

    return res;
  }

  private marshalDocuments(body: string) {
    const idNum = (this.documents.length++).toString();

    if (body.length >= 5000) {
      const validText = body.slice(0, 4999);
      const para = validText.slice(0, validText.lastIndexOf('. '));

      this.documents.push({id: idNum, language: 'en', text: para});
      this.marshalDocuments(body.slice(para.length - 1));
    } else {
      this.documents.push({id: idNum, language: 'en', text: body});
    }
  }

  private getTextAnalysis(documents: Array<Document>, analysisService: string): Promise<Array<KeyPhrasesResponse | SentimentResponse>> {
    const uri = 'https://northeurope.api.cognitive.microsoft.com/text/analytics/v2.0/' + analysisService;

    return new Promise((resolve, reject) => {
      this.http.post(uri, {documents}, {
        headers: new HttpHeaders({
          // 'Content-Type': 'application/octet-stream',
          'Ocp-Apim-Subscription-Key' : this.accessKey,
        })
      }).subscribe((res: CognitiveServicesResponse) => {
        if (res.status === 200) {
          resolve(res.documents);
        } else if (res.errors) {
          reject(new Error(`Failed to retrieve key phrases, it returned this error: ${res.errors}`));
        } else {
          reject(new Error(`Failed to retrieve key phrases, it returned this status: ${res.status}`));
        }
      },
      (err: Observable<Error>) => {
        reject(this.errorHandler(err));
      });
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
