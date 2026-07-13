import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

interface ApiConfig 
{
	apiUrl: string;
}

interface ConfigFile 
{
	production: ApiConfig;
	dmztest: ApiConfig;
	crm9d: ApiConfig;
	localhost: ApiConfig;
	dmztest_f5: ApiConfig
}

@Injectable({
  	providedIn: 'root'
})
export class ConfigService 
{
	private configData: ConfigFile | null = null;

  	constructor(private http: HttpClient) { }

	async loadConfig(): Promise<void> 
	{
    	this.configData = await firstValueFrom(this.http.get<ConfigFile>('config.json'));
  	}

	private getEnvKey(hostname: string): keyof ConfigFile 
	{
		if (hostname === 'localhost' || hostname === '127.0.0.1') 
		{
			return 'localhost';
		}
		else if (hostname.includes('dmztest')) 
		{
			return 'dmztest';
		}
		else if (hostname.includes('crm9d')) 
		{
			return 'crm9d';
		}
		else if (hostname.includes('publiccomplaints.court')) 
		{
			return 'production';
		}
		else if(hostname.includes('test-publiccomplaints'))
		{
			return 'dmztest_f5';
		}

		return 'production';
  	}

	getApiUrl(): string 
	{
    	if (!this.configData) 
		{
      		throw new Error('Config data not loaded! Call loadConfig() first.');
    	}

		const hostname = window.location.hostname;
		const envKey = this.getEnvKey(hostname);

    	return this.configData[envKey].apiUrl;
  	}
}
