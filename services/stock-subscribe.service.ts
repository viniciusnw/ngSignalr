import { Injectable } from '@angular/core';

import { SignalrSubscribesManagement } from '../signalr-subscribes-management.service';
import { SignalrStatesService } from './signalr-states.service';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Store } from '@ngrx/store';
import { AppState } from '../../interfaces/app-state.interface';

@Injectable()
export class StockSubscribeService {

    private initialState: any = {};

    private logged: boolean

    constructor(
        private SlrSubsChnMgMt: SignalrSubscribesManagement,
        private SlrStates: SignalrStatesService,
        private store: Store<AppState>
    ) {
        this.startInitialState();
        store.select(s => s.authentication)
            .subscribe(data => {
                this.logged = (data.currentUser) ? true : false;
            });
    }

    private startInitialState() {
        this.initialState = {
            // Quote
            Quote: {
                Body: {
                    Variation: 0,
                    PriceLastTrade: 0
                }
            },
            // Tendency
            Tendency: {
                Body: {
                    Description: "",
                    Period: null,
                    QuoteCode: "",
                    Tendency: 0,
                }
            },
            // BookAggregated
            BookAggregated: {
                Body: []
            }
        }
    }

    /**
     * recebe um code para se inscrever na cotação
     * caso não tenha usuario logado o canal de delay é assinado
     * 
     * quoteSubscribePerCode || mudar nome depois!
     * @param code // topic
     */
    stockSubscribePerCode(code: string = '') {
        let _stockSubject = new Subject();
        let quoteChannel = 'Quote';

        this.SlrCommService.start().done(() => {
            // cria uma nova entrada para o canal caso ainda não tenha
            this.SlrStates.createState(quoteChannel, code, this.initialState.Quote);
            // se inscreve para ouvir as atualizações de status
            this.SlrStates.newStateEmitter
                .filter(data => `${quoteChannel}_${code}` in data)
                .subscribe(data => _stockSubject.next(data[`${quoteChannel}_${code}`]));
            // entrega o ultimo status
            this.SlrStates.getLastState(quoteChannel, code);
        });

        return _stockSubject.asObservable();
    }

    /**
     * recebe um code e se inscreve nas suas tendencias
     * 
     * @param code 
     */
    tendencySubscribePerCode(code: string = '') {
        let _tendencySubject = new Subject();

        // starta || confere a conexão com o signalr
        this.SlrCommService.start().done(() => {
            // cria uma nova entrada para o canal caso ainda não tenha
            this.SlrStates.createState('Tendency', code, this.initialState.Tendency);
            // se inscreve para ouvir as atualizações de status
            this.SlrStates.newStateEmitter
                .filter(data => `Tendency_${code}` in data)
                .subscribe(data => _tendencySubject.next(data[`Tendency_${code}`]));
            // entrega o ultimo status
            this.SlrStates.getLastState('Tendency', code);
        });

        return _tendencySubject.asObservable();
    }

    /**
     * recebe um code e se increve no seu book
     * 
     * @param code 
     */
    bookAggregatedSubscribePerCode(code: string = ''): Observable<any> {
        let _bookAggregatedSubject = new Subject();

        this.SlrCommService.start().done(() => {
            // cria uma nova entrada para o canal caso ainda não tenha
            this.SlrStates.createState('BookAggregated', code, this.initialState.BookAggregated);
            // se inscreve para ouvir as atualizações de status
            this.SlrStates.newStateEmitter
                .filter(data => `BookAggregated_${code}` in data)
                .subscribe(data => _bookAggregatedSubject.next(data[`BookAggregated_${code}`]));
            // entrega o ultimo status
            this.SlrStates.getLastState('BookAggregated', code);
        });

        return _bookAggregatedSubject.asObservable();
    }

    /**
     * inscricão para recuperar status do mercado
     */
    marketingSubscribe() {
        let _marketingSubject = new Subject();
        this.SlrCommService.start().done(() => {
            this.SlrCommService.createSubscription('Marketing').subscribe(
                data => _marketingSubject.next(data)
            );
        });
        return _marketingSubject.asObservable();
    }

    /**
     * inscrição para o recuperar a hora atual
     */
    timerSubscribe() {
        let _timerSubject = new Subject();
        this.SlrCommService.start().done(() => {
            this.SlrCommService.createSubscription('Timer').subscribe(
                data => _timerSubject.next(data)
            );
        });
        return _timerSubject.asObservable();
    }
}