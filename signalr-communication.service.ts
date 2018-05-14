// Signalr
import { hubConnection, signalR } from "signalr-no-jquery";

// CORE
import { Component, Injectable, NgZone } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { Subject, Observer } from "rxjs";

import { AppState } from '../interfaces/app-state.interface';

// HUB SIGNALR SERVICES
import { SignalrSubscribesManagement } from "./signalr-subscribes-management.service";
import { SignalrProxyChannelsManagement } from './signalr-proxy-channels-management.service';
import { SignalrEventsManagement } from './signalr-events-management.service';
import { SettingsService } from '../services/settings/settings.service';

@Injectable()
export class SignalrCommunicationService {

    public signalrConnectionEvents: any = false; // for now, just Done and error

    private hubConnection: any;

    private subscribeHubProxy: any;

    private config = {
        signalRApi: {
            url: {
                Server: "http://signalr-back-end-url",
                Local: "http://signalr-back-end-url",
            },
            enabled: false
        }
    };

    constructor(
        private settingsService: SettingsService,
        // helpers
        private SlrSubsMgMt: SignalrSubscribesManagement,
        private SlrProxysChnMgMt: SignalrProxyChannelsManagement,
        private SlrEventsMgMt: SignalrEventsManagement,
        // core
        private _ngZone: NgZone
    ) {
        this.stop();
    }

    /**
     * starta uma conexão
     */
    public start() {
        if (this.checkConnection()) {

            // set signalr no jquery conection
            this.hubConnection = hubConnection(this.settingsService.getConfigurationKeyValue('signalRUrl'));

            // create a proxy and your events
            this.subscribeHubProxy = this.hubConnection.createHubProxy("subscribe"); // proxy subscribe
            this.SlrEventsMgMt.createProxyEvents(this.subscribeHubProxy); // create a proxy events 

            // start Connection and return return promisse events
            this.signalrConnectionEvents = this.hubConnection.start(); // start connection
            this.SlrEventsMgMt.createSignalrEvents(this.signalrConnectionEvents); // create a signalr events
        }
        return this.signalrConnectionEvents;
    }
    // status connection check
    private checkConnection() {
        if (typeof this.signalrConnectionEvents.state === "function") {

            switch (this.signalrConnectionEvents.state()) {
                case 'pending':
                    // console.log('pending, waiting');
                    return false;
                case 'rejected':
                    // console.log('rejected, trying again... maybe');
                    return true;
                case 'resolved':
                    // console.log('Conectado');
                    return false;
            }
        }
        else {
            return true;
        }
    }

    /**
     * Solicita uma criação de entrada em um canal
     * 
     * @param CustomChannel 
     * @param topic 
     */
    public createSubscription(CustomChannel: string, topic: string = null): Observable<any> {
        return Observable.create(observer => {
            let subject = this.subscribe(CustomChannel, topic, observer);
            return () => this.unsubscribe(CustomChannel, topic, subject);
        });
    }

    /**
     * cria o objeto de inscrição para um canal/topico
     * 
     * @param CustomChannel 
     * @param topic 
     * @param observer 
     */
    private subscribe(CustomChannel: string, topic: string, observer: Observer<any>): Subject<any> {
        let subject = new Subject();

        // adiciona a inscrição no array de canais
        this.SlrSubsMgMt.addSubscriber(CustomChannel, topic, subject);

        // cria a entrada de proxy
        this.proxySubscribe(CustomChannel, topic, subject);

        // inscrição para ouvir do topico
        subject.subscribe(observer);

        // retorna o obj: subject
        return subject;
    }

    /**
     * cria um objeto de subscrição de um canal/topico
     * 
     * @param CustomChannel 
     * @param topic 
     * @param subject 
     */
    private unsubscribe(CustomChannel: string, topic: string, subject: Subject<any>) {

        // remove a inscriação no array de canais
        this.SlrSubsMgMt.removeSubscriber(CustomChannel, topic, subject);

        // remove a entrada de proxy
        if (topic && !this.SlrSubsMgMt.getSubscribers(CustomChannel, topic).length) {
            this.proxyUnsubscribe(CustomChannel, topic, subject);
        }

        // desiscreve do topico do canal
        subject.unsubscribe();
    }

    /**
     * cria uma entrada no proxy com a conexão
     * 
     * por hora como estamos usando apenas
     * um proxy o mesmo esta setado hardCode: 'subscribe' setado no metodo start()
     * 
     * @param CustomChannel
     * @param topic
     * @param subject
     */
    private proxySubscribe(CustomChannel: string, topic: string, subject: Subject<any>) {
        let invokeParans = this.SlrProxysChnMgMt.proxySubscribeArray(CustomChannel, topic, '');

        this._ngZone.runOutsideAngular(() => {
            this.subscribeHubProxy
                .invoke(...invokeParans)
                .fail(err => {
                    console.warn(err);
                    subject.error(err);
                });
        });
    }

    /**
     * apaga uma entrada de conexão no proxy
     * 
     * não testei
     * 
     * @param CustomChannel
     * @param topic
     * @param subject
     */
    private proxyUnsubscribe(CustomChannel: string, topic: string, subject: Subject<any>) {

        let subscribeChannel = this.SlrProxysChnMgMt.getChannel(CustomChannel, 'unsubscribe');

        this._ngZone.runOutsideAngular(() => {
            this.subscribeHubProxy
                .invoke(subscribeChannel, CustomChannel, topic)
                .fail(err => {
                    console.error(err);
                    subject.error(err);
                });
        });
    }

    /**
     * Para (caso exista) a conexão (INTEIRA) com o canal signalr
     */
    public stop() {
        // clear subscribes
        this.SlrSubsMgMt.removeAllSubscribers();

        // verify hub conections and stop
        if (this.hubConnection) {
            this.hubConnection.stop();
            console.log("SignalR Desconectado");
        }
    }
}