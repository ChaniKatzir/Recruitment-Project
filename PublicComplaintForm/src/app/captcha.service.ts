import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Captcha } from './models/captcha';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class CaptchaService 
{
    constructor(private http: HttpClient, private configService: ConfigService) { }

    async fetchCaptchaSession(): Promise<Observable<Captcha>> 
    {
      await this.configService.loadConfig();

      const localURL = this.configService.getApiUrl() + "/captcha";

      console.log("LocalURL:", localURL);

      return this.http.get<Captcha>(localURL).pipe(
        map(value => ({
          sessionId: value.sessionId,
          captchaImage: `data:image/png;base64,${value.captchaImage}`
        }))
      );
    }

    async InitCaptchaEndpoint()
    {
        (await this.fetchCaptchaSession()).subscribe(captcha => {
          console.log("Captcha session initialized.");
        })
    }
}
