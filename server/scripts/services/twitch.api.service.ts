import { DebugUtility } from '../utility/debug.utility';
import { HttpService } from './http.service';
import { TwitchStreamComponent } from '../components/twitch.stream.component';

export class TwitchAPIService {
  static getBadge(stream: TwitchStreamComponent): Promise<any> {
    return new Promise(function(resolve, reject) {
      let host: string = 'api.twitch.tv';
      let url: string = '/kraken/chat/' + stream.channel.name + '/badges';
      let options: any = {
        headers: {
          'charset': 'UTF-8',
          'Client-ID': '',
          'Content-Type': 'application/json'
        },
        hostname: host,
        method: 'GET',
        path: url,
        port: '443',
        protocol: 'https:'
      };

      HttpService.request(options, undefined).then(function(response) {
        resolve({'status': response['status'], 'data': JSON.parse(response['data'])});
      }).catch(function(err) {
        reject(console.error(err));
      });
    });
  }

  static getBadges(): Promise<any> {
    return new Promise(function(resolve, reject) {
      // Badges should be retrieved from API when available
      let data: any = {
        'admin': 'https://static-cdn.jtvnw.net/chat-badges/admin.png',
        'broadcaster': 'https://static-cdn.jtvnw.net/chat-badges/broadcaster.png',
        'global_mod': 'https://static-cdn.jtvnw.net/chat-badges/globalmod.png',
        'mod': 'https://static-cdn.jtvnw.net/chat-badges/mod.png',
        'staff': 'https://static-cdn.jtvnw.net/chat-badges/staff.png',
        'turbo': 'https://static-cdn.jtvnw.net/chat-badges/turbo.png',
        'premium': 'https://static-cdn.jtvnw.net/badges/v1/a1dd5073-19c3-4911-8cb4-c464a7bc1510/1',
        // The following badges are not currently available through the API
        // The following can be used for bits
        // static-cdn.jtvnw.net/bits/THEME/TYPE/COLOR/SIZE
        // THEME is light or dark
        // TYPE is animated or static
        // COLOR is red for >= 10000 bits, blue for >= 5000, green for >= 1000, purple for >= 100, or otherwise gray
        // SIZE is a digit between 1 and 4
        'cheer1': 'https://static-cdn.jtvnw.net/badges/v1/73b5c3fb-24f9-4a82-a852-2f475b59411c/1',
        'cheer100': 'https://static-cdn.jtvnw.net/badges/v1/09d93036-e7ce-431c-9a9e-7044297133f2/1',
        'cheer1000': 'https://static-cdn.jtvnw.net/badges/v1/0d85a29e-79ad-4c63-a285-3acd2c66f2ba/1',
        'cheer5000': 'https://static-cdn.jtvnw.net/badges/v1/57cd97fc-3e9e-4c6d-9d41-60147137234e/1',
        'cheer10000': 'https://static-cdn.jtvnw.net/badges/v1/68af213b-a771-4124-b6e3-9bb6d98aa732/1',
        'cheer100000': 'https://static-cdn.jtvnw.net/badges/v1/96f0540f-aa63-49e1-a8b3-259ece3bd098/1',
        'subscriber': 'https://static-cdn.jtvnw.net/jtv_user_pictures/subscriber-star.png',
        'warcraft_alliance': 'https://static-cdn.jtvnw.net/badges/v1/c4816339-bad4-4645-ae69-d1ab2076a6b0/1',
        'warcraft_horde': 'https://static-cdn.jtvnw.net/badges/v1/de8b26b6-fd28-4e6c-bc89-3d597343800d/1'
      };

      // Reject is never called because we are not retrieving asynchronously
      resolve({'status': 200});
    });
  }

  static getEmoticons(): Promise<any> {
    return new Promise(function(resolve, reject) {
      // Twitch does not support JSONP or CORS, so we use the following link
      // instead of https://api.twitch.tv/kraken/chat/emoticons
      let host: string = 'api.twitch.tv';
      let url: string = '/kraken/chat/emoticon_images';
      let options: any = {
        headers: {
          'charset': 'UTF-8',
          'Client-ID': '',
          'Content-Type': 'application/json'
        },
        hostname: host,
        method: 'GET',
        path: url,
        port: '443',
        protocol: 'https:'
      };

      HttpService.request(options, undefined).then(function(response) {
        resolve({'status': response['status'], 'data': JSON.parse(response['data'])});
      }).catch(function(err) {
        reject(console.error(err));
      });
    });
  }

  static getStream(stream: TwitchStreamComponent): Promise<any> {
    return new Promise(function(resolve, reject) {
      let host: string = 'api.twitch.tv';
      let url: string = '/kraken/streams' + stream.channel.name;
      let options: any = {
        headers: {
          'charset': 'UTF-8',
          'Client-ID': '',
        },
        hostname: host,
        method: 'GET',
        path: url,
        port: '443',
        protocol: 'https:'
      };

      HttpService.request(options, undefined).then(function(response) {
        resolve({'status': response['status'], 'data': JSON.parse(response['data'])});
      }).catch(function(err) {
        reject(err);
      });
    });
  }

  static getTopStreams(limit: number, offset: number, type: string): Promise<any> {
    return new Promise(function(resolve, reject) {
      let limitQuery: string = 'limit=' + String(limit);
      let offsetQuery: string = 'offset=' + String(offset);
      let streamTypeQuery: string = 'stream_type=' + type;
      let httpQuery: string = '?' + limitQuery + '&' + offsetQuery + '&' + streamTypeQuery;
      let host: string = 'api.twitch.tv';
      let url: string = '/kraken/streams' + httpQuery;
      let options: any = {
        headers: {
          'charset': 'UTF-8',
          'Client-ID': '',
        },
        hostname: host,
        method: 'GET',
        path: url,
        port: '443',
        protocol: 'https:'
      };

      HttpService.request(options, undefined).then(function(response) {
        resolve({'status': response['status'], 'data': JSON.parse(response['data'])});
      }).catch(function(err) {
        reject(err);
      });
    });
  }
}
