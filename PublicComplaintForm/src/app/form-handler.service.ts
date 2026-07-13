import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { phoneOrEmailOrAddressValidator } from './custom-validators';
import { ConfigService } from './config.service';

@Injectable({
	providedIn: 'root'
})

export class FormHandlerService 
{  
	formData: any = {
		step1: FormGroup,
		step2: FormGroup,
		step3: FormGroup,
	};

	uploadedFiles: any[] = [];
	YipuyKoachFile: any;

	constructor(private fb: FormBuilder, private router: Router, private http: HttpClient, private configService: ConfigService) 
	{
		this.formData = {
			step1: this.fb.group({
				contactType: ['', Validators.required],
				isFollowUp: [false],
				previousInquiryNumber: ['']
			}),

			step2: this.fb.group({
				firstName: ['', Validators.required],
				lastName: ['', Validators.required],
				phoneNumber: ['', Validators.pattern('[0-9]+')],
				extraPhoneNumber: ['', Validators.pattern('[0-9]+')],
				faxNumber: ['', Validators.pattern('[0-9]+')],
				idNumber: ['', Validators.required],
				email: ['', Validators.email],
				zipCode: [''],
				city: [''],
				address: [''],
				title: [-1],
				isComplaintOnBehalfOfSomeone: [false],
				agent_FirstName: [''],
				agent_LastName: [''],
				agent_Email: ['', Validators.email],
				agent_PhoneNumber: ['', Validators.pattern('[0-9]+')],
				agent_ExtraPhoneNumber: ['', Validators.pattern('[0-9]+')],
				agent_FaxNumber: ['', Validators.pattern('[0-9]+')],
				agent_IdNumber: ['']
			}),

			step3: this.fb.group({
				contactDescription: ['', Validators.required],
				courtCaseNumber: ['', Validators.pattern('[0-9]+')],
				courthouse: ['']
			})
		};
	}

	updateStepFields(step: string, stepForm: FormGroup): void 
	{
		Object.keys(stepForm.controls).forEach((controlName) => {
			if(this.formData[`step${step}`].contains(controlName))
				this.formData[`step${step}`].get(controlName).setValue(stepForm.get(controlName)?.value);
		});
	}

	getStepValues(step: string): any 
	{
		return this.formData[`step${step}`];
	}

	getFlattenedFormData()
	{
		var newForm = new FormGroup({
			...this.formData.step1.controls,
			...this.formData.step2.controls,
			...this.formData.step3.controls
		});

		return newForm;
	}

	getUploadedFiles()
	{
		return this.uploadedFiles;
	}

	addFile(file: any)
	{
		this.uploadedFiles.push(file);
	}

	addFiles(files: any[])
	{
		for(let i = 0; i < files.length; i++)
		{
			this.addFile(files[i]);
		}
	}

	removeFile(file: any)
	{
		const index = this.uploadedFiles.indexOf(file);
			
		if(index !== -1)
			this.uploadedFiles.splice(index, 1);
	}

	removeFileWithIndex(index: any)
	{
		this.uploadedFiles.splice(index, 1);
	}

	async doSubmitForm(captchaCode: any, sessionId: any)
	{
		await this.configService.loadConfig();

		var flattenedData = this.getFlattenedFormData();
		const submitFormData = new FormData();

		Object.keys(flattenedData.value).forEach(key => {
			const value = flattenedData.get(key)?.value;

			if(key === 'contactType')
				if(value === 'request')
					submitFormData.append(key, '0');
				else submitFormData.append(key, '1');

			else submitFormData.append(key, value);
		});

		for(let i = 0; i < this.uploadedFiles.length; i++)
		{
			submitFormData.append(this.uploadedFiles[i].fileName, this.uploadedFiles[i].file, this.uploadedFiles[i].fileName);
		}

		if(this.YipuyKoachFile)
		{
			submitFormData.append(this.YipuyKoachFile.fileName, this.YipuyKoachFile.file, this.YipuyKoachFile.fileName);
		}

		submitFormData.append('captchaCode', captchaCode);
		submitFormData.append('captchaSessionId', sessionId);

		const localURL = this.configService.getApiUrl() + "/submit-form";

		return this.http.post(localURL, submitFormData, { responseType: 'text' });
	}
}
