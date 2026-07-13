import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormHandlerService } from '../form-handler.service';
import { BreadcrumbsManagerService } from '../breadcrumbs-manager.service';
import { MatSelectModule } from '@angular/material/select';
import { CourtHandlerService } from '../court-handler.service';

@Component({
	selector: 'app-contact-details',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, MatSelectModule],
	templateUrl: './contact-details.component.html',
	styleUrl: './contact-details.component.scss'
})

export class ContactDetailsComponent implements OnInit 
{
	constructor(private breadcrumbsManagerService: BreadcrumbsManagerService,
				private formBuilder: FormBuilder,
				private router: Router,
				private formHandlerService: FormHandlerService,
				private courtHandlerService: CourtHandlerService) {}

	textAreaRemainingCharacters: string = "7000 תווים נותרו";

	selectedCourt: string | undefined = undefined;
	courtsList: any = [
		'בית משפט א',
		'בית משפט ב',
		'בית משפט ג',
		'בית משפט ד',
		'בית משפט ה',
		'בית משפט ו',
		'בית משפט ז',
		'בית משפט ח',
		'בית משפט ט',
	]

	form: any;
	currentPage = "step3";

	async ngOnInit() 
	{
		this.form = this.formBuilder.group({
			contactDescription: ['',[ Validators.required,Validators.maxLength(7000)]],
			courtCaseNumber: ['', Validators.pattern('[0-9]+')],
			courthouse: ['']
		});
		this.updateFormGroup();

	try
	{
		(await this.courtHandlerService.getCourtsList()).subscribe({
			next: (data: any) => {
				if (
					Array.isArray(data?.courtsList) &&
					data.courtsList.length > 0 &&
					typeof data.courtsList[0] === 'string'
				)
				{
				this.courtsList = data.courtsList;

				}
			},
			error: (error: any) => {
				console.log(
					'Could not load courts from the server. Using local list.',
					error
				);
			}
		});
	}
	catch (error)
	{
		console.log(
			'Could not load courts from the server. Using local list.',
			error
		);
	}
}
	ngAfterViewInit(): void
	{
		this.breadcrumbsManagerService.setStep(3);
	}

	OnCourtSelectionChanged(event: any)
	{
		this.selectedCourt = event.value;

		this.form.patchValue({
			courthouse: this.selectedCourt
		});

		this.formHandlerService.updateStepFields('3', this.form);
	}

	GoToNextStep()
	{
		if (this.form.invalid)
		{this.form.markAllAsTouched();

				console.log('Invalid form:',this.form.value,this.form.controls);

			return;
		}
			this.formHandlerService.updateStepFields(
				'3',
				this.form
			);

		this.router.navigate(['/step4']);
	}

	GoToPrevPage()
	{
		this.formHandlerService.updateStepFields('3', this.form);
		this.router.navigate(['/step2']);
	}

	updateFormGroup(): void 
	{
		const stepForm = this.formHandlerService.getStepValues('3');

		Object.keys(stepForm.controls).forEach((controlName) => {

			if(controlName === "courthouse")
			{
				this.selectedCourt = stepForm.get(controlName)?.value;
				this.form.patchValue({
					courthouse: this.selectedCourt
				});
			}

			else if(this.form.contains(controlName))
				this.form?.get(controlName)?.setValue(stepForm.get(controlName)?.value);
		});
		const description =
			this.form.get('contactDescription')?.value ?? '';

		this.textAreaRemainingCharacters =
			`${7000 - description.length} תווים נותרו`;
	}

	OnTextAreaChanged(event: Event)
	{
		const textArea = event.target as HTMLTextAreaElement;
		const currentValue = textArea.value;

		const lengthRemaining = 7000 - currentValue.length;

		this.textAreaRemainingCharacters = `${Math.max(lengthRemaining, 0)} תווים נותרו`;
	}
}
