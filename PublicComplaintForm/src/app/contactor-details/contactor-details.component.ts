import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormHandlerService } from '../form-handler.service';
import { BreadcrumbsManagerService } from '../breadcrumbs-manager.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';
import { CustomRadioButtonComponent } from '../custom-radio-button/custom-radio-button.component';
import { phoneOrEmailOrAddressValidator } from '../custom-validators';
import { UtilsService } from '../utils.service';

@Component({
  selector: 'app-contactor-details',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, MatSelectModule, CustomRadioButtonComponent, FormsModule],
  templateUrl: './contactor-details.component.html',
  styleUrl: './contactor-details.component.scss'
})

export class ContactorDetailsComponent implements OnInit 
{
	form: FormGroup = new FormGroup({});

	titleOptions = 
	[
		"ללא",
		"מר",
		"גברת",
		'עו"ד'
	];

	showMultipleError = false;

	idErrorMessage = "שדה חובה";
	showIdError = false;

	selectedOption: string | undefined;
	selectedCityOption: string | undefined;

	radioButtonOptions = ['כן', 'לא'];
	isComplaintOnBehalfOfSomeoneElse: boolean | undefined;
	listOfHebrewCities: any[] = [];

	isIdValid = true;

	formError = { showError: false, errorTitle: "שגיאה", errorMessage: "על מנת שנוכל ליצור איתך קשר, אנא מלא את אחד הפרטים הבאים: דואר אלקטרוני, כתובת (עיר, רחוב ומיקוד) או מספר פלאפון." };

	constructor(private breadcrumbsService: BreadcrumbsManagerService,
				private formHandlerService: FormHandlerService,
				private http: HttpClient,
				private router: Router,
				private cdr: ChangeDetectorRef,
				private fb: FormBuilder,
				private utils: UtilsService) {}

	ngOnInit(): void 
	{
		this.isIdValid = true;
		this.showMultipleError = false;

		this.form = this.fb.group({
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
		});
		
		this.updateFormGroup();

		//this.form = this.formHandlerService.getStepValues('2');

		this.fetchCitiesFromFile().subscribe(
			(data: string) => {  // ✅ Now 'data' is a UTF-8 string
				const parser = new DOMParser();
				const xmlDoc = parser.parseFromString(data, 'application/xml');
		
				this.listOfHebrewCities = [];
				const rows = xmlDoc.getElementsByTagName('ROW');
				
				for (let i = 0; i < rows.length; i++) {
					const row = rows[i];
					const cityElement = row.getElementsByTagName('שם_ישוב')[0];
					if (cityElement) {
						this.listOfHebrewCities.push(cityElement.textContent);
					}
				}

				this.listOfHebrewCities.sort((a, b) => a.localeCompare(b, 'he'));
		
				console.log('Parsed XML:', xmlDoc);
			},
			(error) => {
				console.error('Error fetching local XML file:', error);
			}
		);

		this.breadcrumbsService.setStep(2);
	}

	getStringFromBool(value: boolean | undefined)
	{
		if(value)
			return this.radioButtonOptions[0];

		else return this.radioButtonOptions[1];
	}

	fetchCitiesFromFile()
	{
		const fileUrl = '/cities.xml';

		let headers = new HttpHeaders();
		headers = headers.append('Content-Type', 'application/xml');

		return this.http.get(fileUrl, { responseType: 'text' })
	}

	onTitleSelectionChanged(event: any)
	{
		this.selectedOption = event.value;

		var selectedOptionIndex = this.titleOptions.indexOf(event.value) + 1;

		this.form?.patchValue({
			title: selectedOptionIndex
		})

		this.formHandlerService.updateStepFields('2', this.form);
	}

	CityOptionChanged(event: string)
	{
		this.selectedCityOption = event;

		this.form?.patchValue({
			city: this.selectedCityOption
		})

		//this.formHandlerService.updateStepFields('2', this.form);
	}

	onRadioButtonClick(event: string)
	{
		if(event === this.radioButtonOptions[0]) // "Yes" option, requires expanding the section
		{
			this.isComplaintOnBehalfOfSomeoneElse = true;
			var expandedSection = document.getElementsByClassName("expanded-section")[0] as HTMLDivElement;

			const currentHeight = expandedSection.scrollHeight;
			expandedSection.style.height = `${currentHeight}px`;
		}
		else // "No" option, requires contracting the section
		{
			this.isComplaintOnBehalfOfSomeoneElse = false;

			var expandedSection = document.getElementsByClassName("expanded-section")[0] as HTMLDivElement;

			expandedSection.style.height = "0";
		}

		this.form?.patchValue({
			isComplaintOnBehalfOfSomeone: this.isComplaintOnBehalfOfSomeoneElse
		})
		//this.formHandlerService.updateStepFields('2', this.form);
	}

	onCitySelectionChanged(event: any)
	{
		this.form?.patchValue({city: event.value})
		//this.formHandlerService.updateStepFields('2', this.form);
	}

	GoToPrevPage()
	{
		this.formHandlerService.updateStepFields('2', this.form);
		this.router.navigate(['/']);
	}

	parseXML(xmlString: string) 
	{
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

		return xmlDoc;
	}

	saveParsedXML(xmlContent: string)
	{
		const blob = new Blob([xmlContent], { type: 'application/xml'});
		const fileURL = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = fileURL;
		a.download = 'parsed_cities.xml';

		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);

		URL.revokeObjectURL(fileURL);
	}

	saveDecodedXml(decodedText: string) 
	{
		const utf8Text = new TextEncoder().encode(decodedText); // Convert to UTF-8
		const blob = new Blob([utf8Text], { type: 'text/xml;charset=utf-8' });
		const a = document.createElement('a');
		const url = URL.createObjectURL(blob);
	
		a.href = url;
		a.download = 'cities_utf8.xml'; // Save as UTF-8
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	OnIdInputChanged(idInput: HTMLInputElement)
	{
		if(idInput.value.length > 9)
			idInput.value = idInput.value.slice(0, 9);
	}

	CloseErrorPopup()
	{
		this.formError.showError = false;
		this.formError.showError = false;
	}

	GoToNextPage()
	{
		const cityValue = this.form?.get('city')?.value;
		//alert('Selected city: ' + cityValue);

		var idInput = document.getElementById('id-input') as HTMLInputElement;

		if(idInput.value.length === 0)
		{
			this.formError.errorMessage = "שדה חובה - תעודת זהות";
			this.formError.showError = true;

			Object.keys(this.form.controls).forEach(field => {
					const control = this.form.get(field);
					control?.markAsTouched({ onlySelf: true });
				});

			this.isIdValid = false;

			//console.log("Failed to move forward because of ID length being 0");

			return;
		}

		if(!this.utils.VerifyIdNumber(idInput.value))
		{
			this.formError.errorMessage = "תעודת זהות לא תקנית";
			this.formError.showError = true;

			//console.log("Failed to move forward because of failed verification of ID number");

			Object.keys(this.form.controls).forEach(field => {
					const control = this.form.get(field);
					control?.markAsTouched({ onlySelf: true });
				});

			this.isIdValid = false;

			return;
		}

		this.isIdValid = true;

		idInput.value = this.utils.FixIdNumber(idInput.value);
		this.form.get('idNumber')?.setValue(idInput.value);

		this.formHandlerService.updateStepFields('2', this.form);

		if(!this.form.valid)
			{
				Object.keys(this.form.controls).forEach(field => {
					const control = this.form.get(field);
					control?.markAsTouched({ onlySelf: true });
				});
	
				//this.formError = { showError: false, errorTitle: "שגיאה", errorMessage: "קיימת שגיאה במילוי הטופס, אנא מלא פרטים תקינים." };
				//this.formError.showError = true;	
	
				// Normal validation error

				//console.log("Failed to move forward because of invalid form.");
	
				return;
			}

		if(	this.form.value.email.length === 0 &&
			this.form.value.phoneNumber.length === 0 &&
			(this.form.value.zipCode.length === 0 || 
			this.form.value.address.length === 0 || 
			this.form.value.city.length === 0))
		{
			console.log(this.form.value.phoneNumber);

			var phoneInput = document.getElementById('phone-number-input') as HTMLInputElement;
			var emailInput = document.getElementById('email-input-field') as HTMLInputElement;
			var citySelect = document.getElementById('city-select') as HTMLSelectElement;
			var addressInput = document.getElementById('address-input') as HTMLInputElement;
			var zipCodeInput = document.getElementById('zip-code-input') as HTMLInputElement;

			phoneInput.classList.add('multiple-error-field');
			emailInput.classList.add('multiple-error-field');
			citySelect.classList.add('multiple-error-field');
			addressInput.classList.add('multiple-error-field');
			zipCodeInput.classList.add('multiple-error-field');

			this.showMultipleError = true;

			//console.log("Failed to move forward because of zero values.");

			return;
		}

		this.isIdValid = true;
		this.showMultipleError = false;
		this.showIdError = false;
		this.formError.showError = false;

		this.router.navigate(['/step3']);
	}

	updateFormGroup(): void 
	{
		var stepForm = this.formHandlerService.getStepValues('2');

		Object.keys(stepForm.controls).forEach((controlName) => {

			if(controlName === "title")
			{
				this.selectedOption = stepForm.get(controlName)?.value;
			}
			else if(controlName === "city")
			{
				this.selectedCityOption = stepForm.get(controlName)?.value;
				this.onCitySelectionChanged(stepForm.get(controlName));
			}
			else if(controlName === "isComplaintOnBehalfOfSomeone")
			{
				if(stepForm.get(controlName)?.value === true)
					this.onRadioButtonClick(this.radioButtonOptions[0])

				if(stepForm.get(controlName)?.value === false)
					this.onRadioButtonClick(this.radioButtonOptions[1])
			}

			if(this.form.contains(controlName))
				this.form?.get(controlName)?.setValue(stepForm.get(controlName)?.value);
		});
	}
}