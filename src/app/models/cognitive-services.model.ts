export class Document {
  id: string;
  language: string;
  text: string;
}

export class CognitiveServicesResponse extends Response {
  documents: Array<KeyPhrasesResponse | SentimentResponse>;
  errors: string;
}

export class KeyPhrasesResponse {
  id: string;
  keyPhrases: Array<string>;
}

export class SentimentResponse {
  id: string;
  score: number;
}
