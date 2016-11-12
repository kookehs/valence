import { BadgeModel, ChannelModel, EmoticonModel, MessageModel, StreamModel } from '../models/twitch.models';
import { DebugUtility } from '../utility/debug.utility';
import { HttpService } from './http.service'
import { TwitchBadgeComponent } from '../components/twitch.badge.component';
import { TwitchChannelComponent } from '../components/twitch.channel.component';
import { TwitchEmoticonComponent } from '../components/twitch.emoticon.component';
import { TwitchMessageComponent } from '../components/twitch.message.component';
import { TwitchStreamComponent } from '../components/twitch.stream.component';

export class DatabaseService {
  static mongoose: any = undefined;
  static db: any = undefined;

  static addBadges(item: TwitchBadgeComponent[]) {
    let options: any = {
      headers: {
        'charset': 'UTF-8',
        'Content-Type': 'application/json'
      },
      hostname: 'localhost',
      method: 'POST',
      path: '/badges',
      port: '3000',
      protocol: 'http:'
    };

    HttpService.request(options, item).then(function(result) {
      if (result['status'] == 200) {
        // successfully posted
      }
    }).catch(function(err) {
      console.error(err);
    });
  }

  static addChannel(item: TwitchChannelComponent) {
    let options: any = {
      headers: {
        'charset': 'UTF-8',
        'Content-Type': 'application/json'
      },
      hostname: 'localhost',
      method: 'POST',
      path: '/channels',
      port: '3000',
      protocol: 'http:'
    };

    HttpService.request(options, item).then(function(result) {
      if (result['status'] == 200) {
        // successfully posted
      }
    }).catch(function(err) {
      console.error(err);
    });
  }

  static addEmoticons(item: TwitchEmoticonComponent[]) {
    let options: any = {
      headers: {
        'charset': 'UTF-8',
        'Content-Type': 'application/json'
      },
      hostname: 'localhost',
      method: 'POST',
      path: '/emoticons',
      port: '3000',
      protocol: 'http:'
    };

    HttpService.request(options, item).then(function(result) {
      if (result['status'] == 200) {
        // successfully posted
      }
    }).catch(function(err) {
      console.error(err);
    });
  }

  static addMessage(item: TwitchMessageComponent) {
    let options: any = {
      headers: {
        'charset': 'UTF-8',
        'Content-Type': 'application/json'
      },
      hostname: 'localhost',
      method: 'POST',
      path: '/messages',
      port: '3000',
      protocol: 'http:'
    };

    HttpService.request(options, item).then(function(result) {
      if (result['status'] == 200) {
        // successfully posted
      }
    }).catch(function(err) {
      console.error(err);
    });
  }

  static addStream(item: TwitchStreamComponent) {
    let options: any = {
      headers: {
        'charset': 'UTF-8',
        'Content-Type': 'application/json'
      },
      hostname: 'localhost',
      method: 'POST',
      path: '/streams',
      port: '3000',
      protocol: 'http:'
    };

    HttpService.request(options, item).then(function(result) {
      if (result['status'] == 200) {
        // successfully posted
      }
    }).catch(function(err) {
      console.error(err);
    });
  }

  static initialize(app: any) {
    DatabaseService.mongoose = require('mongoose');
    DatabaseService.db = DatabaseService.mongoose.connect('mongodb://localhost/valence').connection;
    DatabaseService.db.on('error', function(err) {
      console.error(err);
    });

    DatabaseService.db.once('open', function() {
      BadgeModel.initialize(app, DatabaseService.mongoose);
      ChannelModel.initialize(app, DatabaseService.mongoose);
      EmoticonModel.initialize(app, DatabaseService.mongoose);
      MessageModel.initialize(app, DatabaseService.mongoose);
      StreamModel.initialize(app, DatabaseService.mongoose);

      app.get('/data/AFINN-111.txt', function(request, response) {
        response.status(200).sendFile('data/AFINN-111.txt', {'root': './'});
      });
    });
  }
}
