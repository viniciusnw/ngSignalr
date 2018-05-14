import { Injectable } from '@angular/core';

import { SignalrSubscribesManagement } from './signalr-subscribes-management.service';

@Injectable()
export class SignalrEventsManagement {

    constructor(
        private SlrSubsMgMt: SignalrSubscribesManagement,
    ) { }

    /**
     * cria os eventos de manipulação do proxy / canal / topico
     * 
     * @param subscribeHubProxy 
     */
    public createProxyEvents(subscribeHubProxy: any) {
        // onReceived || onReceiveMessage
        subscribeHubProxy.on("onReceiveMessage", message => this.processIncommingData(message));

        // // onDisconnect
        // subscribeHubProxy.on("onDisconnect", disconnect => {
        //     console.log('onDisconnect');
        //     console.log(disconnect);
        // });
        // // onError
        // subscribeHubProxy.on("onError", error => {
        //     console.log('onError');
        //     console.log(error);
        // });

        // // onReconnect
        // subscribeHubProxy.on("onReconnect", reconnect => {
        //     console.log('onReconnect');
        //     console.log(reconnect);
        // });
        // // onReconnecting
        // subscribeHubProxy.on("onReconnecting", reconnecting => {
        //     console.log('onReconnecting');
        //     console.log(reconnecting);
        // });

        // // onStart
        // subscribeHubProxy.on("onStart", start => {
        //     console.log('onStart');
        //     console.log(start);
        // });
        // // onStarting
        // subscribeHubProxy.on("onStarting", starting => {
        //     console.log('onStarting');
        //     console.log(starting);
        // });

        // // onStateChanged
        // subscribeHubProxy.on("onStateChanged", stateChanged => {
        //     console.log('onStateChanged');
        //     console.log(stateChanged);
        // });
    }

    /**
     * cria os eventos de manipulação da conexão do signalr
     * 
     * @param signalrConnectionEvents 
     */
    public createSignalrEvents(signalrConnectionEvents: any) {

        // // always
        // signalrConnectionEvents.always(all => {
        //     // console.log(signalrConnectionEvents.state());
        // });

        // // success
        // signalrConnectionEvents.done(done => {
        //     console.log('Signalr Conectado');
        // });

        // // error
        // signalrConnectionEvents.fail(err => {
        //     console.log('Signalr Error');
        // });
    }

    /**
     * recebe e processa a msg do socket vindas do evento: onReceiveMessage
     * 
     * @param message 
     */
    private processIncommingData(message: any) {
        let subscribers = this.SlrSubsMgMt.getSubscribers(message.CustomChannel, message.Topic);
        if (message.Topic) {
            subscribers = subscribers.concat(
                this.SlrSubsMgMt.getSubscribers(message.CustomChannel, message.Topic)
            );
        }
        subscribers.forEach(subscriber => subscriber.subject.next(message));
    }
}