import * as http from 'http';
import * as https from 'https';

export class HttpService {
  static request(options: any, item: any): Promise<any> {
    return new Promise(function(resolve, reject) {
      let request: http.ClientRequest;
      let protocol = options.protocol;

      if (protocol == 'http:') {
        request = http.request(options, function(response: http.IncomingMessage) {
          let body: string = '';
          response.setEncoding('utf8');

          response.on('data', function(data) {
            body += data;
          })

          response.on('end', function() {
            let status: number = response.statusCode;

            if (status == 200) {
              resolve({'status': status, 'data': body});
            } else {
              reject(options.method + ' ' + options.hostname + options.path + ' ' + status);
            }
          });

          response.on('error', function(err) {
            reject(console.error(err));
          });
        });
      } else if (protocol == 'https:') {
        request = https.request(options, function(response: http.IncomingMessage) {
          let body: string = '';
          response.setEncoding('utf8');

          response.on('data', function(data) {
            body += data;
          })

          response.on('end', function() {
            let status: number = response.statusCode;

            if (status == 200) {
              resolve({'status': status, 'data': body});
            } else {
              reject(options.method + ' ' + options.hostname + options.path + ' ' + status);
            }
          });

          response.on('error', function(err) {
            reject(console.error(err));
          });
        });
      }

      request.on('error', function(err) {
        reject(console.error(err));
      });

      // Check HTTP method
      if (item) {
        request.write(JSON.stringify(item));
      }

      request.end();
    });
  }
}
