import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';

@Injectable({
    providedIn: 'root'
})

export class CourtHandlerService 
{
  	constructor(private http: HttpClient, private configService: ConfigService) { }

	async getCourtsList()
	{
		await this.configService.loadConfig();

		// var URL = 'http://localhost:94/courts';
		// var URL = 'https://hbm-dmztest:98/courts';
		// var URL = 'https://hbm-crm9d:98/courts';
		// var URL = 'http://localhost:5209/courts';
		// const URL = "https://publiccomplaints.court.gov.il/api/courts";

		const URL = this.configService.getApiUrl() + "/courts";

		return this.http.get(URL);
	}
}
