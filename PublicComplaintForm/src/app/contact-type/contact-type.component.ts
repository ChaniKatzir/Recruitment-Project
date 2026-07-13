import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormHandlerService } from '../form-handler.service';
import { PublicComplaintFormData } from '../models/public-complaint-form-data';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbsManagerService } from '../breadcrumbs-manager.service';
import { CaptchaService } from '../captcha.service';

@Component({
    selector: 'app-contact-type',
    templateUrl: './contact-type.component.html',
    styleUrls: ['./contact-type.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule
    ]
})

export class ContactTypeComponent implements OnInit
{
    form: FormGroup = new FormGroup({});
	
	RequestTooltipVisible: boolean = false;
	ComplaintTooltipVisible: boolean = false;
	InstructionsVisible: boolean = false;
	ShowInvalidFormMessage: boolean = false;
	ShowInvalidFollowUpMessage: boolean = false;

	selectedOption: string = '';

	followUpErrorMessage = "שדה חובה";

	expandButtonData = {
		text: "פניות ותלונות שלא יבדקו על ידי אגף הביקורת",
		image: 'down-arrow.svg'
	};

	constructor
	( 
		private fb: FormBuilder,
        private formHandlerService: FormHandlerService,
        private router: Router,
		private breadcrumbsService: BreadcrumbsManagerService,
		private captchaService: CaptchaService
	) {}

	ngOnInit(): void
	{
		this.captchaService.InitCaptchaEndpoint();

		this.form = this.formHandlerService.getStepValues('1');

		this.ClickedRequest();

        // Load saved data if it exists
        const savedData = this.formHandlerService.getFlattenedFormData().value;
        if (savedData && savedData.contactType) {
            this.selectedOption = savedData.contactType;
            this.form.patchValue({ contactType: this.selectedOption });
            
            // Update UI to reflect the selection
            setTimeout(() => {
                if (this.selectedOption === 'request') {
                    this.ClickedRequest();
                } else if (this.selectedOption === 'complaint') {
                    this.ClickedComplaint();
                }
            });
        }

		if(savedData && savedData.previousInquiryNumber)
		{
			this.form.patchValue({ previousInquiryNumber: savedData.previousInquiryNumber });
			const followUpNumberInput = document.getElementById('followUpInput') as HTMLInputElement;
			followUpNumberInput.value = savedData.previousInquiryNumber;
		}

		if(savedData && savedData.isFollowUp)
		{
			this.form.patchValue({ isFollowUp: savedData.isFollowUp });
			const followUpCheckbox = document.getElementById('followUpCheckbox') as HTMLInputElement;
			followUpCheckbox.checked = savedData.isFollowUp;

			const target = document.getElementById('slideBox') as HTMLDivElement;

			const currentHeight = target.scrollHeight;

			if(followUpCheckbox.checked)
			{
				console.log("checked");

				target.style.height = `${currentHeight}px`;
				this.form.patchValue({ isFollowUp: true });
			}
			else
			{
				console.log("unchecked");

				target.style.height = '0px';
				this.form.patchValue({ isFollowUp: false });
			}
		}

		this.breadcrumbsService.setStep(1);
	}

	ToggleInstructions(): void
	{
		var expandableContainer = document.getElementsByClassName('expanded-text-container')[0] as HTMLDivElement;

		const currentHeight = expandableContainer.scrollHeight;

		if(this.InstructionsVisible)
		{
			this.InstructionsVisible = false;
			expandableContainer.style.height = '0px';

			this.expandButtonData.text = "פניות ותלונות שלא יבדקו על ידי אגף הביקורת";
			this.expandButtonData.image = "down-arrow.svg";
		}
		else
		{
			this.InstructionsVisible = true;
			expandableContainer.style.height = `${currentHeight}px`;

			this.expandButtonData.text = "סגירה";
			this.expandButtonData.image = "up-arrow.svg";
		}
	}

	ToggleInstructionsMobile(): void
	{
		var expandableContainer = document.getElementsByClassName('expanded-text-container')[1] as HTMLDivElement;

		const currentHeight = expandableContainer.scrollHeight;

		if(this.InstructionsVisible)
		{
			this.InstructionsVisible = false;
			expandableContainer.style.height = '0px';

			this.expandButtonData.text = "פניות ותלונות שלא יבדקו על ידי אגף הביקורת";
			this.expandButtonData.image = "down-arrow.svg";
		}
		else
		{
			this.InstructionsVisible = true;
			expandableContainer.style.height = `${currentHeight}px`;

			this.expandButtonData.text = "סגירה";
			this.expandButtonData.image = "up-arrow.svg";
		}
	}

	ClickedRequest(): void
	{
		var requestRadio = document.getElementById("request-radio") as HTMLDivElement;
		var complaintRadio = document.getElementById("complaint-radio") as HTMLDivElement;

		requestRadio.classList.add("selected-radio-button");
		complaintRadio.classList.remove("selected-radio-button");

		this.selectedOption = "request";

		this.form.patchValue({ contactType: this.selectedOption });
		this.formHandlerService.updateStepFields('1', this.form);

		this.ShowInvalidFormMessage = false;
	}

	ClickedComplaint(): void
	{
		var requestRadio = document.getElementById("request-radio") as HTMLDivElement;
		var complaintRadio = document.getElementById("complaint-radio") as HTMLDivElement;

		complaintRadio.classList.add("selected-radio-button");
		requestRadio.classList.remove("selected-radio-button");

		this.selectedOption = "complaint";

		this.form.patchValue({ contactType: this.selectedOption });
		this.formHandlerService.updateStepFields('1', this.form);

		this.ShowInvalidFormMessage = false;
	}

	MoveToNextStep(): void
	{
		const followUpNumberInput = document.getElementById('followUpInput') as HTMLInputElement;

        this.form = this.formHandlerService.getStepValues('1');

		if(!this.form.valid)
		{
			this.ShowInvalidFormMessage = true;
			return;
		}

		console.log("IsFollowUp value is ", this.form.get('isFollowUp')?.value);
		console.log("previousInquiryNumber value is ", this.form.get('previousInquiryNumber')?.value);

		const prevNumber = followUpNumberInput.value;

		if(this.form.get('isFollowUp')?.value)
		{
			if(prevNumber.length === 0)
			{
				this.followUpErrorMessage = "שדה חובה";
				this.ShowInvalidFollowUpMessage = true;
				return;
			}

			if(!this.isValidTicketFormat(prevNumber))
			{
				this.followUpErrorMessage = "שגיאה בפורמט מספר הפנייה";
				this.ShowInvalidFollowUpMessage = true;
				return;
			}
		}

		this.form.patchValue({ previousInquiryNumber: prevNumber });

		this.ShowInvalidFollowUpMessage = false;
		this.router.navigate(['/step2']);
	}

	isValidTicketFormat(input: string): boolean 
	{
		const pattern = /^[פת]-\d+\/\d{4}$/;
		return pattern.test(input);
	}

	OnMouseEnterRequestTooltip(): void
	{
		this.RequestTooltipVisible = true;
	}

	OnMouseLeaveRequestTooltip(): void
	{
		this.RequestTooltipVisible = false;
	}

	OnMouseEnterComplaintTooltip(): void
	{
		this.ComplaintTooltipVisible = true;
	}

	OnMouseLeaveComplaintTooltip(): void
	{
		this.ComplaintTooltipVisible = false;
	}

	OnFollowUpCheckboxChange()
	{
		var followUpCheckbox = document.getElementById("followUpCheckbox") as HTMLInputElement;
		const target = document.getElementById('slideBox') as HTMLDivElement;

		const currentHeight = target.scrollHeight;

		if(followUpCheckbox.checked)
		{
			//console.log("checked");

			target.style.height = `${currentHeight}px`;
			this.form.patchValue({ isFollowUp: true });
		}
		else
		{
			//console.log("unchecked");

			this.ShowInvalidFollowUpMessage = false;

			target.style.height = '0px';
			this.form.patchValue({ isFollowUp: false });
		}
	}
}