import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { Subject, Observer } from "rxjs";

@Injectable()
export class SignalrSubscribesManagement {

    public subscribers: any = [];

    constructor() { }

    /**
     * adiciona uma inscrição no array
     * 
     * @param CustomChannel 
     * @param topic 
     * @param subject 
     */
    addSubscriber(CustomChannel: string, topic: string, subject: Subject<any>) {
        this.subscribers.push({
            CustomChannel,
            topic,
            subject,
            firstMessageReceived: false
        });
    }

    /**
     * remove uma inscrição do array
     * 
     * @param CustomChannel 
     * @param topic 
     * @param subject 
     */
    removeSubscriber(CustomChannel: string, topic: string, subject: Subject<any>) {
        this.subscribers = this.subscribers.filter(
            sub => !(sub.channel === CustomChannel && sub.topic === topic)
        );
    }

    /**
     * retorna a inscrição de um canal (com todos os topicos), ou um topico
     * 
     * @param CustomChannel 
     * @param topic 
     * @param ignoreTopic 
     */
    getSubscribers(CustomChannel: string, topic: string = null, ignoreTopic: boolean = true) {
        return this.subscribers.filter(
            sub => sub.CustomChannel === CustomChannel && ((ignoreTopic && !topic) || sub.topic === topic)
        );
    }

    /**
     * remove todas as incrições do array
     */
    removeAllSubscribers() {
        this.subscribers = [];
    }
}