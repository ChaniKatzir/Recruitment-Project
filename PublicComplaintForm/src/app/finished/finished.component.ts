import { Component, OnInit } from '@angular/core';
import { BreadcrumbsManagerService } from '../breadcrumbs-manager.service';
import { Router, RouterModule } from '@angular/router';

@Component({
	selector: 'app-finished',
	standalone: true,
	imports: [RouterModule],
	templateUrl: './finished.component.html',
	styleUrl: './finished.component.scss'
})

export class FinishedComponent implements OnInit 
{
	constructor(private breadcrumbsManagerService: BreadcrumbsManagerService, private router: Router) {}
	
	ngOnInit(): void 
	{
		this.breadcrumbsManagerService.setStep(6);
	}

	NavigateHome()
	{
		this.router.navigate(['/']);
	}
}