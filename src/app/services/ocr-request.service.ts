import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class OcrRequestService {

  constructor(private http: HttpClient) {}

  public postRequest(fileContent: string | ArrayBuffer) {
    const httpOptions = this.buildHttpOptions();

    const uri = 'https://northeurope.api.cognitive.microsoft.com/vision/v2.0/recognizeText';
    const req = this.http.post(uri, fileContent, httpOptions)
    .pipe(
      catchError(err => this.errorHandler(err))
    );

    req.pipe(
      map((res: Response) => res.json())
    )
    .subscribe((res) => {
      this.parseResponse(res);
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

  private parseResponse(res) {

  }

  private errorHandler(error: Observable<Error>): Observable<Object> {
    throw error;
  }
}
