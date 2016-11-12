import { TwitchChannelComponent } from './twitch.channel.component';

export class TwitchStreamComponent {
  averageFPS: number;
  channel: TwitchChannelComponent;
  delay: number;
  id: number;
  game: string;
  viewers: number;

  constructor() {
    this.averageFPS = 0;
    this.channel = new TwitchChannelComponent();
    this.delay = 0;
    this.id = -1;
    this.game = '';
    this.viewers = 0;
  }
}
