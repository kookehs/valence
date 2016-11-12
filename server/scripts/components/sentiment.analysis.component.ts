import { HttpService } from '../services/http.service'

export class SentimentAnalysisComponent {
  static valenceMap: {[word: string]: number;} = {};

  static analyze(message: string): number {
    let valence: number = 0;
    // Keys in valenceMap are all lowercase
    let data: string = message.toLowerCase();

    for (let word of data.split(' ')) {
      word = word.trim();

      if (word in SentimentAnalysisComponent.valenceMap) {
        valence += SentimentAnalysisComponent.valenceMap[word.trim()];
      }
    }

    return valence;
  }

  static buildValenceMap(data: string) {
    // Data is a single string split by newline to obtain each entry
    // Each entry is tab-separated therefore we must split based on tabs
    for (let line of data.split('\n')) {
      let info: string[] = line.split('\t');
      let word: string = info[0];
      let value: string = info[1];
      SentimentAnalysisComponent.valenceMap[word] = Number(value);
    }
  }

  static initialize(url: string) {
    // Retrieve AFINN-111 file
    let options: any = {
      headers: {
        'charset': 'UTF-8',
        'Content-Type': 'text'
      },
      hostname: 'localhost',
      method: 'GET',
      path: url,
      port: '3000',
      protocol: 'http:'
    };

    HttpService.request(options, undefined).then(function(response) {
      SentimentAnalysisComponent.buildValenceMap(response['data']);
    }).catch(function(err) {
      console.error(err);
    });
  }
}
