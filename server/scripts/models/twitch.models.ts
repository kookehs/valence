import { DebugUtility } from '../utility/debug.utility'

export class BadgeModel {
  static schema = undefined;
  static model = undefined;

  static initialize(app: any, mongoose: any) {
    BadgeModel.schema = new mongoose.Schema({
      code: String,
      url: String
    });

    BadgeModel.model = mongoose.model('badges', BadgeModel.schema);

    app.post('/badges', function(request, response) {
      DebugUtility.log(1, 'info', 'adding badges to database');
      let badges = request.body;

      for (let item of badges) {
        BadgeModel.model.update({'code': item['code']}, item, {upsert: true}, function(err, raw) {
          if (err) {
            return console.error(err);
          }

          response.status(200).json(raw);
        });
      }
    });
  }
}

export class ChannelModel {
  static schema = undefined;
  static model = undefined;

  static initialize(app: any, mongoose: any) {
    ChannelModel.schema = new mongoose.Schema({
      badge: String,
      displayName: String,
      id: Number,
      followers: Number,
      language: String,
      mature: Boolean,
      name: String,
      partner: Boolean,
      status: String,
      views: Number
    });

    ChannelModel.model = mongoose.model('channels', ChannelModel.schema);

    app.get('/channels', function(request, response) {
      let limit: number = request.query.limit || 100;

      ChannelModel.model.find({}).sort({name: 'asc'}).limit(Number(limit)).exec(function(err, docs) {
        if (err) {
          return console.error(err);
        }

        response.status(200).json(docs);
      });
    });

    app.post('/channels', function(request, response) {
      DebugUtility.log(1, 'info', 'adding channel to database');
      let item: any = request.body;

      ChannelModel.model.update({'name': item['name']}, item, {upsert: true}, function(err, raw) {
        if (err) {
          return console.error(err);
        }

        response.status(200).json(raw);
      });
    });
  }
}

export class EmoticonModel {
  static schema = undefined;
  static model = undefined;

  static initialize(app: any, mongoose: any) {
    EmoticonModel.schema = new mongoose.Schema({
      code: String,
      id: Number,
      series: Number,
      url: String
    });

    EmoticonModel.model = mongoose.model('emoticons', EmoticonModel.schema);

    app.post('/emoticons', function(request, response) {
      // Emoticons are updated every 24 hours since last udpate
      EmoticonModel.model.findOne({'code': 'Kappa'}, function(err, doc) {
        if (err) {
          return console.error(err);
        }

        let oneDay: number = 24 * 60 * 60 * 1000;
        let lastUpdate: Date = (doc != null) ? doc._id.getTimestamp() : new Date(1970, 0, 1);
        let currentTime: Date = new Date();
        let difference: number = currentTime.getTime() - lastUpdate.getTime();

        if (difference > oneDay) {
          DebugUtility.log(1, 'info', 'removing emoticons');

          EmoticonModel.model.remove({}).then(function(doc) {
            DebugUtility.log(1, 'info', 'removed emoticons')
            DebugUtility.log(1, 'info', 'adding emoticons');

            EmoticonModel.model.insertMany(request.body).then(function(docs) {
              DebugUtility.log(1, 'info', 'added emoticons');
              response.status(200);
            }).catch(function(err) {
              DebugUtility.log(1, 'error', err);
            });
          }).catch(function(err) {
            DebugUtility.log(1, 'error', err);
          });
        } else {
          DebugUtility.log(1, 'info', 'emoticons are up-to-date (' + lastUpdate + ')');
          response.status(200);
        }
      });
    });
  }
}

export class MessageModel {
  static schema = undefined;
  static model = undefined;

  static initialize(app: any, mongoose: any) {
    MessageModel.schema = new mongoose.Schema({
      badges: [String],
      channel: String,
      emotes: [String],
      game: String,
      message: String,
      valence: Number,
      timestamp: Date,
      user: String,
      userColor: String
    });

    MessageModel.model = mongoose.model('messages', MessageModel.schema);

    app.get('/messages', function(request, response) {
      let channel: string = request.query.channel;

      if (channel != null) {
        MessageModel.model.find({'channel': channel}, function(err, docs) {
          if (err) {
            return console.error(err);
          }

          response.status(200).json(docs);
        });
      }
    });

    app.post('/messages', function(request, response) {
      let item = new MessageModel.model(request.body);

      item.save(function(err, obj, number) {
        if (err) {
          return console.error(err);
        }

        response.status(200).json(item);
      });
    });
  }
}

export class StreamModel {
  static schema = undefined;
  static model = undefined;

  static initialize(app: any, mongoose: any) {
    StreamModel.schema = new mongoose.Schema({
      averageFPS: [Number],
      channel: String,
      delay: [Number],
      id: [Number],
      game: [String],
      timestamp: [Date],
      viewers: [Number]
    });

    StreamModel.model = mongoose.model('streams', StreamModel.schema);

    app.get('/streams', function(request, response) {
      let name: string = request.query.channel || '';

      StreamModel.model.find({'channel': name}, function(err, doc) {
        if (err) {
          return console.error(err);
        }

        response.status(200).json(doc);
      });
    });

    app.post('/streams', function(request, response) {
      DebugUtility.log(1, 'info', 'adding stream to database');
      let item: any = request.body;

      StreamModel.model.findOne({'channel': item['channel']['name']}, function(err, doc) {
        if (err) {
          return console.error(err);
        }

        if (doc) {
          doc['averageFPS'].push(item['averageFPS']);
          doc['delay'].push(item['delay']);
          doc['id'].push(item['id']);
          doc['game'].push(item['game']);
          doc['timestamp'].push(new Date());
          doc['viewers'].push(item['viewers']);

          doc.save(function (err) {
            if (err) {
              console.error(err);
            }

            response.status(200).json(doc);
          });
        } else {
          let stream = new StreamModel.model({
            averageFPS: [item['averageFPS']],
            channel: item['channel']['name'],
            delay: [item['delay']],
            id: [item['id']],
            game: [item['game']],
            timestamp: [new Date()],
            viewers: [item['viewers']]
          });

          stream.save(function(err, obj, number) {
            if (err) {
              return console.error(err);
            }

            response.status(200).json(stream);
          });
        }
      });
    });
  }
}
