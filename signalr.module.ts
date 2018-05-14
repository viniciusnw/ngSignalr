// CORE
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from "@angular/common/http";

// Signalr service
import { SignalrCommunicationService } from './signalr-communication.service';
// helpers
import { SignalrSubscribesManagement } from './signalr-subscribes-management.service';
import { SignalrProxyChannelsManagement } from './signalr-proxy-channels-management.service';
import { SignalrEventsManagement } from './signalr-events-management.service';

// Signalr serviços expostos
import { StockSubscribeService } from './services/stock-subscribe.service';
import { SignalrStatesService } from './services/signalr-states.service';

@NgModule({
    imports: [
        CommonModule,
        BrowserModule,
        HttpClientModule
    ],
    exports: [
        
    ],
    declarations: [
        
    ],
    providers: [
        // The one service
        SignalrCommunicationService,

        // Helpers
        SignalrSubscribesManagement,
        SignalrProxyChannelsManagement,
        SignalrEventsManagement,

        // middle services
        StockSubscribeService,
        SignalrStatesService
    ],
})
export class SignalrModule { }
