export class TwitchChannelComponent {
  badge: string;
  displayName: string;
  id: number;
  followers: number;
  language: string;
  mature: boolean;
  name: string;
  partner: boolean;
  status: string;
  views: number;

  constructor() {
    this.badge = '';
    this.displayName = '';
    this.id = -1;
    this.followers = -1;
    this.language = '';
    this.mature = false;
    this.name = '';
    this.partner = false;
    this.status = '';
    this.views = -1;
  }
}
