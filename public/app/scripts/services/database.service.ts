import { HttpService } from './http.service'
import { Injectable } from '@angular/core';
import { Request, RequestMethod } from '@angular/http';

@Injectable()
export class DatabaseService {
  constructor(private httpService: HttpService) {}

  getChannels(limit: number) {
    let date: Date = new Date();
    let options: Request = new Request({
      method: RequestMethod.Get,
      url: 'channels?date=' + date.getTime() + '&limit=' + limit
    });

    return this.httpService.request(options);
  }

  getMessages(name: string) {
    let date: Date = new Date();
    let options: Request = new Request({
      method: RequestMethod.Get,
      url: 'messages?channel=' + name + '&date=' + date.getTime()
    });

    return this.httpService.request(options);
  }

  getStreams(name: string) {
    let date: Date = new Date();
    let options: Request = new Request({
      method: RequestMethod.Get,
      url: 'streams?channel=' + name + '&date=' + date.getTime()
    });

    return this.httpService.request(options);
  }
}
