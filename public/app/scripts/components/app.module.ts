import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';

import { TwitchVisualizationComponent }  from './twitch.visualization.component';

@NgModule({
  imports: [BrowserModule, HttpModule],
  declarations: [TwitchVisualizationComponent],
  bootstrap: [TwitchVisualizationComponent]
})

export class AppModule { }
