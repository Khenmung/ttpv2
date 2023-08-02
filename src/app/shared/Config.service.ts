import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, publishReplay, refCount } from 'rxjs/operators';

export interface Config {
    componentType: string, 
    show: Boolean
}

@Injectable({
    providedIn: 'root'
})

export class ConfigService {

    configs: Observable<Config[]>;
    api_url='';
    constructor(private httpClient: HttpClient) { }

    // Get configs from server | HTTP GET
    getConfigs(): Observable<Config[]> {

        // Cache it once if configs value is false
        if (!this.configs) {
            this.configs = this.httpClient.get(`${this.api_url}/configs`).pipe(
                map(data => data['configs']),
                publishReplay(1), // this tells Rx to cache the latest emitted
                refCount() // and this tells Rx to keep the Observable alive as long as there are any Subscribers
            );
        }

        return this.configs;
    }

    // Clear configs
    clearCache() {
        this.configs = null;
    }

}