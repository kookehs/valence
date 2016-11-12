import { Component, AfterViewChecked } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { HttpService } from '../services/http.service';
import { TwitchChannelComponent } from './twitch.channel.component';
import { TwitchMessageComponent } from './twitch.message.component';
import { TwitchStreamComponent } from './twitch.stream.component';

declare var google: any;

@Component({
  selector: 'twitch',
  templateUrl: 'app/views/twitch.visualization.component.html',
  styleUrls: ['app/css/twitch.visualization.component.css'],
  providers: [DatabaseService, HttpService]
})

export class TwitchVisualizationComponent {
  static chartsLoaded: any = false;

  autoScroll: boolean;
  channel: string;
  channelBadge: string;
  channels: TwitchChannelComponent[];
  exploring: boolean;
  filteredMessages: TwitchMessageComponent[];
  filters: {[filter: string]: string;}
  gameFilters: string[];
  loading: boolean;
  messages: TwitchMessageComponent[];
  notice: string;
  streams: TwitchStreamComponent[];
  timeFilters: string[];
  valences: {[attitude: string]: number;}

  constructor(private databaseService: DatabaseService) {
    if (TwitchVisualizationComponent.chartsLoaded == false) {
      google.charts.load('current', {'packages': ['corechart']});
      TwitchVisualizationComponent.chartsLoaded = true;
    }

    this.autoScroll = false;
    this.channel = '';
    this.channelBadge = '';
    this.channels = [];
    this.exploring = false;
    this.filters = {
      'game': 'Any game',
      'time': 'Any time'
    };
    this.gameFilters = [];
    this.loading = false;
    this.messages = [];
    this.notice = 'Choose a channel to view analytics';
    this.streams = [];
    this.timeFilters = [
      "Any time", "Past hour", "Past 24 hours",
      "Past week", "Past month", "Past year"
    ];
    this.valences = {};
    this.requestChannels();
  }

  ngAfterViewChecked() {
    if (window.scrollX == 0 && window.scrollY == 0) {
      if (this.exploring == true && this.autoScroll == true) {
        // Multiply by 0.05 because the explore banner is 5% of view height
        window.scrollTo(0, window.innerHeight - window.innerHeight * 0.05);
        this.autoScroll = false;
      }
    }
  }

  buildPieChart = () => {
    let channel: string = this.channel;
    let valences: any = this.valences;
    let updateLoading: any = this.updateLoading;

    google.charts.setOnLoadCallback(function() {
      let data: any = new google.visualization.DataTable();
      data.addColumn('string', 'attitude');
      data.addColumn('number', 'valence');

      for (let key in valences) {
        if (key == 'total') {
          continue;
        }

        data.addRow([key, Math.abs(valences[key])]);
      }

      let options: any = {
        backgroundColor: {
          fill: 'transparent'
        },
        colors: ['#ED6468', '#D0A53E', '#58C252'],
        legend: {
          textStyle: {
            color: '#FFFAFA'
          }
        },
        pieHole: 0.4,
        title: channel + ' (Total: ' + valences['total'] + ' points)',
        titleTextStyle: {
          color: '#FFFAFA'
        }
      };

      let pieChart = new google.visualization.PieChart(document.getElementById('pie-chart'));
      pieChart.draw(data, options);
      window.scrollTo(0, 0);
      updateLoading(false);
    });
  }

  calculateValence = () => {
    let negative: number = 0;
    let neutral: number = 0;
    let positive: number = 0;
    let total: number = 0;

    for (let item of this.filteredMessages) {
      let valence: number = item.valence;
      total += valence;

      if (valence > -3 && valence < 3) {
        neutral += valence;
      } else if (valence < -2) {
        negative += valence;
      } else if (valence > 2) {
        positive += valence;
      }
    }

    this.valences['negative'] = negative;
    this.valences['neutral'] = neutral;
    this.valences['positive'] = positive;
    this.valences['total'] = total;
  }

  filterMessages = () => {
    this.filteredMessages = [];
    let filtered: TwitchMessageComponent[] = [];

    for (let item of this.messages) {
      let filterTime: number = 0;

      if (this.filters['time'] == 'Past hour') {
        filterTime = 1 * 60 * 60 * 1000;
      } else if (this.filters['time'] == 'Past 24 hours') {
        filterTime = 24 * 60 * 60 * 1000;
      } else if (this.filters['time'] == 'Past week') {
        filterTime = 7 * 24 * 60 * 60 * 1000;
      } else if (this.filters['time'] == 'Past month') {
        filterTime = 30 * 24 * 60 * 60 * 1000;
      } else if (this.filters['time'] == 'Past year') {
        filterTime = 365 * 24 * 60 * 60 * 1000;
      } else {
        filterTime = 0;
      }

      let currentTime: Date = new Date();
      let messageTime: Date = item.timestamp;
      let difference: number = currentTime.getTime() - messageTime.getTime();
      let validDate: boolean = false;
      let validGame: boolean = false;

      if (filterTime == 0 || difference < filterTime) {
        validDate = true;
      }

      let game: string = this.filters['game'];

      if (game == 'Any game' || item.game == game) {
        validGame = true;
      }

      if (validDate == true && validGame == true) {
        filtered.push(item);
      }
    }

    this.filteredMessages = filtered;
  }

  filterOptionGame = (game: string) => {
    this.filters['game'] = game;
    this.filterMessages();
    this.calculateValence();
    this.buildPieChart();
  }

  filterOptionTime = (time: string) => {
    this.filters['time'] = time;
    this.filterMessages();
    this.calculateValence();
    this.buildPieChart();
  }

  parseChannels = (data: any[]) => {
    let channels: TwitchChannelComponent[] = [];

    for (let item of data) {
      let channel: TwitchChannelComponent = new TwitchChannelComponent();
      let badge: string = item['badge'];
      channel.badge = (badge != null) ? item['badge'] : 'http://s.jtvnw.net/jtv_user_pictures/hosted_images/GlitchIcon_purple.png';
      channel.displayName = item['displayName'];
      channel.followers = item['followers'];
      channel.id = item['id'];
      channel.language = item['langauge'];
      channel.mature = item['mature'];
      channel.name = item['name'];
      channel.partner = item['partner'];
      channel.status = item['status'];
      channel.views = item['views'];
      channels.push(channel);
    }

    this.channels = channels;
  }

  parseMessages = (data: any[]) => {
    let messages: TwitchMessageComponent[] = [];

    for (let item of data) {
      let message: TwitchMessageComponent = new TwitchMessageComponent();
      message.badges = item['badges'];
      message.channel = item['channel'];
      message.emotes = item['emotes'];
      message.game = item['game'];
      message.message = item['message'];
      message.valence = item['valence'];
      message.timestamp = new Date(item['timestamp']);
      message.user = item['user'];
      message.userColor = item['userColor'];
      messages.push(message);
    }

    this.messages = messages;
  }

  parseStreams = (data: any[]) => {
    this.gameFilters = ['Any game'];

    let item: any = data[0];
    let streams: TwitchStreamComponent[] = [];

    for (let i = 0; i < item['id'].length; ++i) {
      let stream: TwitchStreamComponent = new TwitchStreamComponent();
      stream.averageFPS = item['averageFPS'][i];
      stream.channel.name = item['channel'];
      stream.delay = item['delay'][i];
      stream.id = item['id'][i];
      stream.game = item['game'][i];
      stream.viewers = item['viewers'][i];
      streams.push(stream);

      if (this.gameFilters.indexOf(stream.game) == -1) {
        this.gameFilters.push(stream.game);
      }
    }

    this.streams = streams;
  }

  requestChannels = () => {
    this.databaseService.getChannels(100).then(this.parseChannels);
  }

  requestChannel = (name: string) => {
    this.loading = true;
    this.channel = '';
    let channel: TwitchChannelComponent = undefined;

    for (let item of this.channels) {
      if (item['name'] == name) {
        channel = item;
        this.channel = name;
        this.channelBadge = item['badge'];
      }
    }

    if (channel != undefined) {
      let parseStreams: any = this.parseStreams;

      this.databaseService.getStreams(name).then(function(data) {
        if (data.length == 1) {
          parseStreams(data);
        }
      });

      let buildPieChart: any = this.buildPieChart;
      let calculateValence: any = this.calculateValence;
      let filterMessages: any = this.filterMessages;
      let parseMessages: any = this.parseMessages;
      let resetFilters: any = this.resetFilters;

      this.databaseService.getMessages(name).then(function(data) {
        parseMessages(data);
        resetFilters();
        filterMessages();
        calculateValence();
        buildPieChart();
      });
    } else {
      this.updateNotice('Could not find channel in database');
    }
  }

  resetFilters = () => {
    this.filters = {
      'game': 'Any game',
      'time': 'Any time'
    };
  }

  updateExploring = (status: boolean) => {
    this.exploring = status;
  }

  updateLoading = (status: boolean) => {
    this.loading = status;
  }

  updateNotice = (status: string) => {
    this.notice = status;
  }

  viewChannel = () => {
    window.location.href = 'https://www.twitch.tv/' + this.channel;
  }

  viewExplore = () => {
    this.updateExploring(true);
    this.autoScroll = true;
  }
}
