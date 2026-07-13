import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormHandlerService } from '../form-handler.service';
import { BreadcrumbsManagerService } from '../breadcrumbs-manager.service';

@Component({
	selector: 'app-document-upload',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule],
	templateUrl: './document-upload.component.html',
	styleUrl: './document-upload.component.scss'
})

export class DocumentUploadComponent implements OnInit
{
	constructor(private breadcrumbsManagerService: BreadcrumbsManagerService, private router: Router, private formDataService: FormHandlerService) {}

	showFileErrorMessage = false;
	fileErrorMessage = "בעיה - נא לוודא שגודל הקובץ אינו עולה על 10MB. בנוסף, יש לוודא שסכום גודל הקבצים אינו עולה על 50MB.";

	fileSizes = ['Kb', 'Mb', 'Gb'];

	selectedFiles: any[] = [];
	yipuyKoachFile: any;
	showErrorMessage = false;

	didUseYipuyKoach = false;
	
	ngOnInit(): void
	{
		this.breadcrumbsManagerService.setStep(4);
		this.didUseYipuyKoach = this.formDataService.getStepValues('2').get('isComplaintOnBehalfOfSomeone').value;
		this.yipuyKoachFile = this.formDataService.YipuyKoachFile;
		this.selectedFiles = this.formDataService.getUploadedFiles();
	}

	onFileSelected(event: any)
	{
		console.log(event.target.files.length);

		let totalFileSize = 0;

		for(let i = 0; i < this.selectedFiles.length; i++)
		{
			totalFileSize += this.selectedFiles[i].file.size;
		}

		for(let i = 0; i < event.target.files.length; i++)
		{
			const file = event.target.files[i];

			if(file)
			{
				totalFileSize += file.size;

				if(totalFileSize > 50 * 1024 * 1024) // 50 MB
				{
					this.showFileErrorMessage = true;
					this.fileErrorMessage = "סכום גודל הקבצים אינו יכול לעלות על 50MB.";
					return;
				}

				console.log('File selected:', file.name);

				var fileSize = file.size;
				var counter = 0;

				while(fileSize > 1)
				{
					fileSize = fileSize / 1000;
					counter++;

					if(fileSize < 1)
					{
						fileSize = fileSize * 1000;
						counter--;
						break;
					}
				}

				console.log('File size after exiting while loop:', fileSize, this.fileSizes[counter-1]);
				
				let truncFileName = file.name;

				if (window.innerWidth < 750 && file.name.length > 15) 
				{
					truncFileName = file.name.substring(0, 15) + '...';
				}

				if(!((this.fileSizes[counter-1] === 'Mb' && fileSize > 10) || (this.fileSizes[counter-1] === 'Gb')))
				{
					this.selectedFiles.push({ 'fileName': file.name, 'fileSize': fileSize + ' ' + this.fileSizes[counter-1], 'fileSizeUnits': this.fileSizes[counter-1], 'statusImage': 'file-done-icon.svg', 'status': true, 'file': file, 'fileNameTrunc': truncFileName });
					this.showFileErrorMessage = false;
				}
				else
				{
					this.fileErrorMessage = "בעיה - נא לוודא שגודל הקובץ אינו עולה על 10MB. בנוסף, יש לוודא שסכום גודל הקבצים אינו עולה על 50MB.";
					this.showFileErrorMessage = true;
				}
				//this.formDataService.addFile(this.selectedFiles[this.selectedFiles.length - 1]);
			}
		}


		(event.target as HTMLInputElement).value = '';
		//var filePicker = document.getElementById('filePicker') as HTMLInputElement;

		//filePicker.value = '';
	}

	onYipuyKoachFileSelected(event: any)
	{
		for(let i = 0; i < event.target.files.length; i++)
		{
			const file = event.target.files[i];

			if(file)
			{
				console.log('File selected:', file.name);

				var fileSize = file.size;
				var counter = 0;

				while(fileSize > 1)
				{
					fileSize = fileSize / 1000;
					counter++;

					if(fileSize < 1)
					{
						fileSize = fileSize * 1000;
						counter--;
						break;
					}
				}

				console.log('File size after exiting while loop:', fileSize, this.fileSizes[counter-1]);
				
				if(!((this.fileSizes[counter-1] === 'Mb' && fileSize > 10) || (this.fileSizes[counter-1] === 'Gb')))
				{
					this.yipuyKoachFile = { 'fileName': file.name, 'fileSize': fileSize + ' ' + this.fileSizes[counter-1], 'fileSizeUnits': this.fileSizes[counter-1], 'statusImage': 'file-done-icon.svg', 'status': true, 'file': file };
					this.formDataService.YipuyKoachFile = this.yipuyKoachFile;
				}
				else
				{
					this.fileErrorMessage = "בעיה - נא לוודא שגודל הקובץ אינו עולה על 10MB. בנוסף, יש לוודא שסכום גודל הקבצים אינו עולה על 50MB.";
					this.showFileErrorMessage = true;
				}
			}
		}


		(event.target as HTMLInputElement).value = '';
		// var filePicker = document.getElementById('filePicker') as HTMLInputElement;

		// filePicker.value = '';
	}

	DeleteFile(index: number)
	{
		this.selectedFiles.splice(index, 1);
		this.formDataService.removeFile(index);
	}

	DeleteYipuyKoachFile(event: MouseEvent)
	{
		event.stopPropagation();
		
		this.yipuyKoachFile = undefined;
		this.formDataService.YipuyKoachFile = undefined;
	}

	GoToNextStep()
	{
		if(this.didUseYipuyKoach)
		{
			if(this.yipuyKoachFile)
			{
				this.showErrorMessage = false;
				//this.formDataService.addFiles(this.selectedFiles);
				this.formDataService.YipuyKoachFile = this.yipuyKoachFile;
				this.router.navigate(['/step5']);
			}
			else 
			{
				this.showErrorMessage = true;
			}
		}
		else
		{
			//this.formDataService.addFiles(this.selectedFiles);
			this.showErrorMessage = false;
			this.router.navigate(['/step5']);
		}
	}

	GoToPrevStep()
	{
		if(this.yipuyKoachFile)
			this.formDataService.YipuyKoachFile = this.yipuyKoachFile;

		this.router.navigate(['/step3']);
	}
}
