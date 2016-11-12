import { DatabaseService } from '../services/database.service';
import { DebugUtility } from '../utility/debug.utility';
import { HttpService } from '../services/http.service';
import { RandomUtility } from '../utility/random.utility';
import { SentimentAnalysisComponent } from './sentiment.analysis.component';
import { TwitchBadgeComponent } from './twitch.badge.component';
import { TwitchEmoticonComponent } from './twitch.emoticon.component';
import { TwitchIRCService } from '../services/twitch.irc.service';
import { TwitchMessageComponent } from './twitch.message.component';
import { TwitchAPIService } from '../services/twitch.api.service';
import { TwitchStreamComponent } from './twitch.stream.component';

export class TwitchComponent {
  static streams: {[channel: string]: TwitchStreamComponent;} = {};

  static addStream(stream: TwitchStreamComponent) {
    Promise.all([
        TwitchAPIService.getBadge(stream).then(function(result) {
          TwitchComponent.parseAPIBadge(result['data'], stream);
        }).catch(function(err) {
          console.error(err);
        })
    ]).then(function(result) {
      TwitchComponent.streams[stream.channel.name] = stream;
      TwitchIRCService.join(stream.channel.name);
      DatabaseService.addChannel(stream.channel);
      DatabaseService.addStream(stream);
    }).catch(function(err) {
      console.error(err);
    });
  }

  static initialize() {
    TwitchAPIService.getBadges().then(function(result) {
      TwitchComponent.parseAPIBadges(result['data']).then(function(result) {
        DatabaseService.addBadges(result);
      }).catch(function(err) {
        console.error(err);
      });
    }).catch(function(err) {
      console.error(err);
    });

    TwitchAPIService.getEmoticons().then(function(result) {
      TwitchComponent.parseAPIEmoticons(result['data']).then(function(result) {
        DatabaseService.addEmoticons(result);
      }).catch(function(err) {
        console.error(err);
      });
    }).catch(function(err) {
      console.error(err);
    });
  }

  static listener(data: string) {
    if (data.includes('PING :tmi.twitch.tv')) {
      // Send PONG to keep connection alive
      TwitchIRCService.send(data.replace('PING', 'PONG'));
    } else if (data.split(' ')[1] == '001') {
      // 001 indicates we successfully connected to Twitch IRC servers
      // Request the server send us the optional tags before each message
      TwitchIRCService.send('CAP REQ :twitch.tv/tags');
    } else if (data.includes('PRIVMSG #')) {
      let message: TwitchMessageComponent = TwitchComponent.parseIRCMessage(data);
      DatabaseService.addMessage(message);
    }
  }

  static parseAPIBadge(data: any, stream: TwitchStreamComponent) {
    let subscriber: any = data['subscriber'];
    let url: string = (subscriber) ? subscriber['image'] : null;
    stream.channel.badge = url;
    let badge: TwitchBadgeComponent = new TwitchBadgeComponent();
    badge.code = stream.channel.name;
    badge.url = url;
    DatabaseService.addBadges([badge]);
  }

  static parseAPIBadges(data: any): Promise<TwitchBadgeComponent[]> {
    return new Promise(function(resolve, reject) {
      let badges: TwitchBadgeComponent[] = [];

      for (let key in data) {
        let badge: TwitchBadgeComponent = new TwitchBadgeComponent();
        badge.code = key;
        badge.url = data[key];
        badges.push(badge);
      }

      resolve(badges);
    });
  }

  static parseAPIEmoticons(data: any): Promise<any> {
    return new Promise(function(resolve, reject) {
      let emoticons: TwitchEmoticonComponent[] = [];

      for (let emoticon of data['emoticons']) {
        let emote: TwitchEmoticonComponent = new TwitchEmoticonComponent();
        emote.code = emoticon['code'];
        emote.id = emoticon['id'];
        emote.series = emoticon['emoticon_set'];
        emote.url = 'http://static-cdn.jtvnw.net/emoticons/v1/' + emote.id + '/1.0';
        emoticons.push(emote);
      }

      resolve(emoticons);
    });
  }

  static parseIRCBadges(data: string): string[] {
    let badges: string[] = [];

    for (let badge of data.split(',')) {
      if (badge == '') {
        break;
      }

      let info: string[] = badge.split('/');
      let code: string = info[0];
      let value: string = info[1];

      // Tags differ from IRC to API
      if (code == 'moderator') {
        code = 'mod';
      } else if (code == 'bits') {
        code = 'cheer' + value;
      }

      badges.push(code);
    }

    return badges;
  }

  static parseIRCEmotes(data: string): string[] {
    let emotes: string[] = [];

    for (let emote of data.split('/')) {
      if (emote == '') {
        break;
      }

      let info: string[] = emote.split(':');
      let id: string = info[0];
      emotes.push(id);
    }

    return emotes;
  }

  static parseIRCMessage(data: string): TwitchMessageComponent {
    let badgesStart: number = data.indexOf('=', data.indexOf('badges')) + 1;
    let badgesEnd: number = data.indexOf(';', badgesStart);
    let badges: string = data.substring(badgesStart, badgesEnd);

    let channelStart: number = data.indexOf('#', data.indexOf('PRIVMSG')) + 1;
    let channelEnd: number = data.indexOf(' :', channelStart);
    let channel: string = data.substring(channelStart, channelEnd);

    let colorStart: number = data.indexOf('=', data.indexOf('color')) + 1;
    let colorEnd: number = data.indexOf(';', colorStart);
    let color: string = data.substring(colorStart, colorEnd);

    let emotesStart: number = data.indexOf('=', data.indexOf('emotes')) + 1;
    let emotesEnd: number = data.indexOf(';', emotesStart);
    let emotes: string = data.substring(emotesStart, emotesEnd);

    let userStart: number = data.indexOf('=', data.indexOf('display-name')) + 1;
    let userEnd: number = data.indexOf(';', userStart);
    let user: string = data.substring(userStart, userEnd);

    let message: string = data.substring(channelEnd + 2);

    if (color == '') {
      color = RandomUtility.stringToColor(user);
    }

    let item: TwitchMessageComponent = new TwitchMessageComponent();
    item.badges = TwitchComponent.parseIRCBadges(badges);
    item.channel = channel;
    item.emotes = TwitchComponent.parseIRCEmotes(emotes);
    item.game = TwitchComponent.streams[channel].game;
    item.message = message;
    item.valence = SentimentAnalysisComponent.analyze(message);
    item.timestamp = new Date();
    item.user = user;
    item.userColor = color;

    return item;
  }

  static parseAPIStreams(data: any) {
    for (let streamData of data['streams']) {
      let stream: TwitchStreamComponent = new TwitchStreamComponent();
      stream.averageFPS = streamData['average_fps'];
      stream.delay = streamData['delay'];
      stream.id = streamData['_id'];
      stream.game = streamData['game'];
      stream.viewers = streamData['viewers'];

      let channelData: any = streamData['channel'];
      stream.channel.id = channelData['_id'];
      stream.channel.displayName = channelData['display_name'];
      stream.channel.followers = channelData['followers'];
      stream.channel.language = channelData['language'];
      stream.channel.mature = channelData['mature'];
      stream.channel.name = channelData['name'];
      stream.channel.partner = channelData['partner'];
      stream.channel.status = channelData['status'];
      stream.channel.views = channelData['views'];
      TwitchComponent.addStream(stream);
    }
  }

  static partIRCChannels() {
    DebugUtility.log(1, 'info', 'parting irc channels');

    for (let key in TwitchComponent.streams) {
      TwitchIRCService.part(TwitchComponent.streams[key].channel.name);
    }
  }

  static requestTopStreams(limit: number, offset: number, type: string) {
    TwitchAPIService.getTopStreams(limit, offset, 'all').then(function(result) {
      TwitchComponent.parseAPIStreams(result['data']);
    }).catch(function(err) {
      console.error(err);
    });
  }

  static update() {
    TwitchComponent.partIRCChannels();
    TwitchComponent.requestTopStreams(10, 0, 'all');
    setTimeout(TwitchComponent.update, 300000);
  }
}
