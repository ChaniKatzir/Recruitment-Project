import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BreadcrumbsManagerService } from '../breadcrumbs-manager.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TopBarComponent } from '../top-bar/top-bar.component';

@Component({
	selector: 'app-main-form',
	standalone: true,
	imports: [CommonModule, RouterOutlet, MatProgressBarModule, TopBarComponent],
	templateUrl: './main-form.component.html',
	styleUrl: './main-form.component.scss'
})

export class MainFormComponent 
{
	currentStep: number = 1;

	constructor(private breadcrumbsManagerService: BreadcrumbsManagerService, private cdr: ChangeDetectorRef) { }

	ngAfterViewInit(): void
	{
		this.breadcrumbsManagerService.currentStep$.subscribe(step => {
			this.currentStep = step;

			this.cdr.detectChanges();

			this.updateBreadcrumbClasses();
		});	
	}

	onChildActivate() 
	{
    	window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  	}	
  
	updateBreadcrumbClasses()
	{
		for(let i = 1; i <= 5; i++)
		{
			const stepCircle = document.getElementById(`step-${i}`) as HTMLDivElement;
			const stepText = document.getElementById(`step-${i}-text`) as HTMLParagraphElement;

			stepCircle.classList.value = "";
			stepText.classList.value = "";

			if(i < this.currentStep)
			{
				stepCircle.classList.add("finished-step");
				stepText.classList.add("active-step-text");
			}
			else if(i === this.currentStep)
			{
				stepCircle.classList.add("active-step");
				stepText.classList.add("active-step-text");
			}
			else
			{
				stepCircle.classList.add("inactive-step");
				stepText.classList.add("inactive-step-text");
			}

			if(i > 1)
			{
				const stepPath = document.getElementById(`step-${i}-path`) as HTMLDivElement;

				stepPath.classList.value = "";

				if(i <= this.currentStep)
				{
					stepPath.classList.add("active-path");
				}
				else
				{
					
					stepPath.classList.add("inactive-path");
				}
			}
		}
	}
}
