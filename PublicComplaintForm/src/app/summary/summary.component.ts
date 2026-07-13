import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormHandlerService } from '../form-handler.service';
import { PublicComplaintFormData } from '../models/public-complaint-form-data';
import { CaptchaService } from '../captcha.service';
import { BreadcrumbsManagerService } from '../breadcrumbs-manager.service';
import { ConfigService } from '../config.service';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss'
})
export class SummaryComponent implements OnInit 
{
	formData: any;
	captchaSession: any;
	uploadedFiles: any[] = [];

	isLoading: boolean = false;

	showCaptchaError: boolean = false;
	errorMessage: string = "טעות במילוי קוד האימות";

	formError = { showError: false, errorTitle: "שגיאה", errorMessage: "ישנה שגיאה בשליחת הנתונים." };
	
	constructor (private breadcrumbsService: BreadcrumbsManagerService,
				private formHandlerService: FormHandlerService,
				private captchaService: CaptchaService,
				private router: Router,
				private configService: ConfigService) 
	{
		this.formData = new PublicComplaintFormData();
	}

	disableSendButton: boolean = false;

	async ngOnInit() 
	{
		this.disableSendButton = false;

		// Load the complete form data + documents
		this.formData = this.formHandlerService.getFlattenedFormData().value;

		console.log(this.formData);

		this.uploadedFiles = this.formHandlerService.getUploadedFiles();

		this.isLoading = true;

		(await this.captchaService.fetchCaptchaSession()).subscribe(captcha => {
			this.captchaSession = captcha;
		})

		this.isLoading = false;

		this.breadcrumbsService.setStep(5);

		console.log(this.uploadedFiles);
	}

	async OnCaptchaRefresh()
	{
		(await this.captchaService.fetchCaptchaSession()).subscribe(captcha => {
			this.captchaSession = captcha;
		})
	}

	CloseErrorPopup()
	{
		this.formError.showError = false;
	}

	async OnFormSubmit(captchaInput: HTMLInputElement)
	{
		if(this.disableSendButton)
			return;

		if(captchaInput.value.length < 1)
		{
			captchaInput.classList.add('invalid-captcha');
			this.showCaptchaError = true;
			return;
		}

		this.disableSendButton = true;

		let gotAnError = false;

		(await this.formHandlerService.doSubmitForm(captchaInput.value, this.captchaSession.sessionId)).subscribe({
			next: async (value: any) => {

				//console.log(value);

				//onsole.log(value.includes("Invalid"));

				if(value.includes('Invalid'))
				{
					//console.log("Invalid captcha detected.");

					captchaInput.classList.add('invalid-captcha');

					this.errorMessage = "טעות במילוי קוד האימות.";
					this.showCaptchaError = true;
					gotAnError = true;

					this.disableSendButton = false;
				}
				else if(value.includes('Failed to submit form.'))
				{
					this.errorMessage = "קרתה שגיאה בשליחת הנתונים, כדאי לנסות שוב בעוד מספר דקות.";
					this.showCaptchaError = true;
					gotAnError = true;

					this.disableSendButton = false;
				}
				else if(value.includes("illegal file extension"))
				{
					this.errorMessage = "קובץ שהועלה אינו תקין, יש לוודא כי הקבצים שהועלו הם קבצי תמונה בלבד.";
					this.showCaptchaError = true;
					gotAnError = true;

					this.disableSendButton = false;
				}
				else if (value.includes("מורשת")) 
				{
					// Reconstruct form content (excluding files)
					const flattenedData = this.formHandlerService.getFlattenedFormData();
					const contentObj: any = {};

					Object.keys(flattenedData.value).forEach(key => {
						const val = flattenedData.get(key)?.value;
						contentObj[key] = key === 'contactType' ? (val === 'request' ? '0' : '1') : val;
					});

					// Include captcha info
					contentObj.captchaCode = captchaInput.value;
					contentObj.captchaSessionId = this.captchaSession.sessionId;

					const base64Content = btoa(JSON.stringify(contentObj));

					// Get user's IP
					let userIP = 'Unknown';
					try {
						const ipResponse = await fetch('https://api.ipify.org?format=json');
						const ipJson = await ipResponse.json();
						userIP = ipJson.ip;
					} catch (err) {
						console.warn('Could not fetch IP address:', err);
					}

					const localURL = this.configService.getApiUrl() + "/send-email";

					// Send email
					fetch(localURL, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							Issue: base64Content,
							IP: userIP
						})
					}).then(res => res.json())
					.then(resp => console.log('Email sent response:', resp))
					.catch(err => console.error('Failed to send email:', err));
            	}

			},
			error: (err: any) => {
				this.errorMessage = "קרתה שגיאה בשליחת הנתונים, כדאי לנסות שוב בעוד מספר דקות.";
				this.showCaptchaError = true;
				gotAnError = true;

				this.disableSendButton = false;
			},
			complete: () => {

				if(!gotAnError)
				{
					this.showCaptchaError = false;
					captchaInput.classList.remove('invalid-captcha');
					console.log("Finished submitting form.");
					this.router.navigate(['/done']);
				}
			},
		});
	}

	GoToPrevStep()
	{
		this.router.navigate(['/step4']);
	}
}
