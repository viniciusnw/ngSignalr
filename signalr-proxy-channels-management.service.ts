import { Injectable } from '@angular/core';

@Injectable()
export class SignalrProxyChannelsManagement {

    // canais
    // for now, just one proxy
    // current proxy: subscrib
    private proxyChannelList = {
        Quote: {
            subscribe: "SubscribeQuote",
            unsubscribe: "UnsubscribeQuote",
            token: true
        },
        QuoteDelay: {
            subscribe: "SubscribeQuoteDelay",
            unsubscribe: "UnsubscribeQuoteDelay",
            token: false
        },
        BookAggregated: {
            subscribe: "SubscribeBookAggregated",
            unsubscribe: "UnsubscribeBookAggregated",
            token: true
        },
        Tendency: {
            subscribe: "SubscribeTendency",
            unsubscribe: "UnsubscribeTendency",
            token: true
        },
        ResearchAdvices: {
            subscribe: "SubscribeResearchAdvices",
            unsubscribe: "UnsubscribeResearchAdvices",
            token: true
        },
        Marketing: {
            subscribe: "SubscribeMarketStatus",
            unsubscribe: "UnsubscribeMarketStatus",
            token: false
        },
        Timer: {
            subscribe: "SubscribeTime",
            unsubscribe: "UnsubscribeTime",
            token: false
        },
        Notification: {
            subscribe: "SubscribeNotification",
            unsubscribe: "UnsubscribeNotification",
            token: true
        }
    }

    constructor() { }

    /**
     * 
     * @param channel channel name
     * @param type string tipo de assinatura "subscribe" || "unsubscribe"
     */
    getChannel(channel, type: string = "subscribe") {
        return this.proxyChannelList[channel][type];
    }

    /**
     * retorna um objeto de conexão para o proxy
     * 
     * @param channel 
     * @param topic 
     * @param jwtToken 
     * 
     * @return [channel, CustomChannel, topic, jwtToken] or
     * @return [channel, CustomChannel]
     */
    proxySubscribeArray(channel, topic, jwtToken) {

        let proxySubscribeArray = [];

        proxySubscribeArray.push(this.proxyChannelList[channel]['subscribe']);
        proxySubscribeArray.push(channel);

        (topic) ? proxySubscribeArray.push(topic) : null;
        (jwtToken && this.proxyChannelList[channel]['token']) ? proxySubscribeArray.push(jwtToken) : null;

        return proxySubscribeArray;
    }
}