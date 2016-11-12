'use strict';

import { DatabaseService } from './scripts/services/database.service';
import { DebugUtility } from './scripts/utility/debug.utility';
import { SentimentAnalysisComponent } from './scripts/components/sentiment.analysis.component';
import { TwitchComponent } from './scripts/components/twitch.component';
import { TwitchIRCService } from './scripts/services/twitch.irc.service';

var express = require('express');
var app = express();
var port = process.env.PORT || 3000;

app.use(express.static('./public'));

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '8mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '6mb'}));

var morgan = require('morgan');
app.use(morgan('dev'));

app.get('/', function(request, response, next) {
  response.sendFile('public/index.html', {'root': './'});
});

app.listen(port);

DebugUtility.filter = ['info', 'error', 'irc out'];
DebugUtility.threshold = 0;
DebugUtility.log(1, 'info', 'Server listening on port ' + port);

DatabaseService.initialize(app);
TwitchIRCService.initialize(TwitchComponent.listener);
TwitchComponent.initialize();
SentimentAnalysisComponent.initialize('/data/AFINN-111.txt');

function update() {
  TwitchComponent.update();
}

update();
