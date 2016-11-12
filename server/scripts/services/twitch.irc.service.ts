import { DebugUtility } from '../utility/debug.utility';
import * as WebSocket from 'ws';

export class TwitchIRCService {
  static socket: WebSocket = new WebSocket('ws://irc-ws.chat.twitch.tv:80');

  static initialize(listener: any) {
    TwitchIRCService.socket.onclose = function(event) {
      DebugUtility.log(1, 'info', 'irc socket closed');
    }

    TwitchIRCService.socket.onmessage = function(event) {
      DebugUtility.log(1, 'irc in', event.data);
      listener(event.data);
    }

    TwitchIRCService.socket.onopen = function() {
      DebugUtility.log(1, 'info', 'irc socket opened');
      // The following nickname requires no authentcation
      TwitchIRCService.send('NICK justinfan127001');
    }
  }

  static join(channel: string) {
    TwitchIRCService.send('JOIN #' + channel);
  }

  static part(channel: string) {
    TwitchIRCService.send('PART #' + channel);
  }

  static send(data: string) {
    DebugUtility.log(1, 'irc out', data);
    TwitchIRCService.socket.send(data);
  }
}
