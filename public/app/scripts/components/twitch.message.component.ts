export class TwitchMessageComponent {
  badges: string[];
  channel: string;
  emotes: string[];
  game: string;
  message: string;
  valence: number;
  timestamp: Date;
  user: string;
  userColor: string;

  constructor() {
    this.badges = [];
    this.channel = '';
    this.emotes = [];
    this.game = '';
    this.message = '';
    this.valence = 0;
    this.timestamp = undefined;
    this.user = '';
    this.userColor = '';
  }
}
