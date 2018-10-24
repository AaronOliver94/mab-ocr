export class ComputerVisionResponse {
    status: string;
    recognitionResult: Array<RecognitionResult>;
}

export class RecognitionResult {
   lines: Array<LineResult>;
}

export class LineResult {
    boundingBox: Array<number>;
    text: string;
}
