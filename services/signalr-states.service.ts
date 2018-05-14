import { Injectable, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { SignalrCommunicationService } from '../signalr-communication.service';
import { SignalrSubscribesManagement } from '../signalr-subscribes-management.service';

@Injectable()
export class SignalrStatesService {

    private $lastStates = [];

    public newStateEmitter = new Subject();

    constructor(
        private SlrCommService: SignalrCommunicationService,
        private SlrSubsChnMgMt: SignalrSubscribesManagement
    ) { }

    // cria uma entrada no state caso não exista
    public createState(channel, topic = null, data) {
        // return no caso de ja ter uma inscrição para o canal+topic 
        if (this.SlrSubsChnMgMt.getSubscribers(channel, topic).length) return;

        let channelIdxName = `${channel}${(topic) ? '_' + topic : ''}`;
        let newStatusEntry = { [channelIdxName]: data };

        this.newStateEmitter.next(newStatusEntry);
        this.$lastStates.push(newStatusEntry);

        this.SlrCommService.createSubscription(channel, topic)
            .subscribe(data => this.setState(channel, topic, data));
    }

    // seta um novo state a cada nova entrada
    public setState(channel, topic = null, data) {
        let channelIdxName = `${channel}${(topic) ? '_' + topic : ''}`;
        this.$lastStates.map((lSchannel, lSchannelIdx) => {
            if (channelIdxName in lSchannel) {
                lSchannel[channelIdxName] = data;
                setTimeout(() => {
                    this.newStateEmitter.next({ [channelIdxName]: data });
                });
            }
        });
    }

    // emitte um state solicitado
    public getLastState(channel, topic = null) {
        let channelIdxName = `${channel}${(topic) ? '_' + topic : ''}`;
        this.$lastStates.map((lSchannel, lSchannelIdx) => {
            if (channelIdxName in lSchannel) {
                setTimeout(() => {
                    this.newStateEmitter.next(lSchannel);
                });
            }
        });
    }
}