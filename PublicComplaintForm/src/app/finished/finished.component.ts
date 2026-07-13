import { Component, OnInit } from '@angular/core';
import { BreadcrumbsManagerService } from '../breadcrumbs-manager.service';
import { Router, RouterModule } from '@angular/router';
import { FormHandlerService } from '../form-handler.service';

@Component({
	selector: 'app-finished',
	standalone: true,
	imports: [RouterModule],
	templateUrl: './finished.component.html',
	styleUrl: './finished.component.scss'
})

export class FinishedComponent implements OnInit 
{
	constructor(private breadcrumbsManagerService: BreadcrumbsManagerService, private router: Router, private formHandlerService: FormHandlerService) {}
	
	ngOnInit(): void 
	{
		this.breadcrumbsManagerService.setStep(6);
	}

	NavigateHome()
	{
		this.formHandlerService.resetForm();
		this.router.navigate(['/']);
	}
}