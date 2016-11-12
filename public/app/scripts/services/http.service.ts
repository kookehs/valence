import { Injectable } from '@angular/core';
import { Http, Request, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise'

@Injectable()
export class HttpService {
  constructor(private http: Http) {}

  request(options: Request): Promise<any> {
    return this.http.request(options).toPromise().then(this.extract);
  }

  private extract(response: Response) {
    let body: any = response.json();
    return body || {};
  }
}
