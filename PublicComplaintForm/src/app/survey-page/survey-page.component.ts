import { Component, OnInit } from '@angular/core';
import { TopBarComponent } from "../top-bar/top-bar.component";
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SurveyData } from '../models/survey-data';
import { SurveyQuestion } from '../models/survey-question';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomRadioButtonComponent } from "../custom-radio-button/custom-radio-button.component";
import { ConfigService } from '../config.service';

@Component({
    selector: 'app-survey-page',
    imports: [TopBarComponent, CommonModule, CustomRadioButtonComponent],
    templateUrl: './survey-page.component.html',
    styleUrl: './survey-page.component.scss'
})

export class SurveyPageComponent implements OnInit
{
	constructor(private http: HttpClient, private acitvatedRoute: ActivatedRoute, private router: Router, private configService: ConfigService) {}

	async ngOnInit()
	{
		this.showErrorMessage = false;
		this.allowSubmit = true;

		await this.configService.loadConfig();
	}

	errorMessage = "לא ניתן לשלוח את הסקר. הסקר הזה כבר נשלח בעבר.";
	showErrorMessage = false;

	allowSubmit = true;

	surveyQuestions: SurveyQuestion[] = [
		{ 
			question: "מהי מידת שביעות רצונך <strong>מהשירות שקיבלת</strong> ממחלקת פניות הציבור בפנייתך?",
			isFreeText: false,
			answer: "0",
			multipleSelection: false,
			options: [],
			starCount: 5 
		},
		{ 
			question: "מהי מידת שביעות רצונך <strong>ממשך זמן הטיפול</strong> של מחלקת פניות הציבור בפנייתך?",
			isFreeText: false,
			answer: "0",
			multipleSelection: false,
			options: [],
			starCount: 5 
		},
		{ 
			question: "עד כמה לדעתך המענה לפנייתך היה <strong>מקצועי וברור</strong>?",
			isFreeText: false,
			answer: "0",
			multipleSelection: false,
			options: [],
			starCount: 4
		},
		{ 
			question: "עד כמה המענה סייע לך <strong>בפתרון הבעיה</strong> שלשמה פנית?",
			isFreeText: false,
			answer: "0",
			multipleSelection: false,
			options: [],
			starCount: 4
		},
		{ 
			question: "באיזו מידה המענה שקיבלת <strong>ענה על ציפיותיך</strong>?",
			isFreeText: false,
			answer: "0",
			multipleSelection: false,
			options: [],
			starCount: 4
		},
		{
			question: "כיצד לדעתך ניתן <strong>לייעל את השירות</strong> של מחלקת פניות הציבור?",
			isFreeText: true,
			answer: "0",
			multipleSelection: false,
			options: [],
			starCount: 0 
		},
		{
			question: "באיזה אמצעי אתה מעדיף לקבל את המענה לפנייתך?",
			isFreeText: false,
			answer: "0",
			multipleSelection: true,
			options: ['דוא"ל', 'דואר', 'פקס', 'לא רלוונטי'],
			starCount: 0
		}
	];

	starArray(count: number): number[] 
	{
		return Array.from({ length: count }, (_, i) => i + 1);
	}

	onRadioButtonClick(event: string)
	{
		for(let i = 0; i < this.surveyQuestions.length; i++)
		{
			for(let j = 0; j < this.surveyQuestions[i].options.length; j++)
			{
				if(event === this.surveyQuestions[i].options[j])
				{
					this.surveyQuestions[i].answer = (j + 1).toString();
				}
			}
		}
	}

	OnMouseEnterRatingStar(event: MouseEvent)
	{
		const div = event.currentTarget as HTMLDivElement;
		const element = div.querySelector('img') as HTMLImageElement;

		const prefix = element.id.split('-')[0];
		const ratingNumber = parseInt(element.id.split('-')[1]); // The star number that was hovered (1, 2, 3, 4, or 5)

		for(let i = 1; i <= ratingNumber; i++)
		{
			const star = document.getElementById(`${prefix}-${i}`) as HTMLImageElement;
			star.src = `full_star.svg`;
		}
	}

	OnMouseLeaveRatingStar(event: MouseEvent)
	{
		const div = event.currentTarget as HTMLDivElement;
		const element = div.querySelector('img') as HTMLImageElement;

		const prefix = element.id.split('-')[0];
		const questionNumber = parseInt(prefix.split("question")[1]); // The question number (1, 2, 3, or 4... etc)
		const ratingNumber = parseInt(element.id.split('-')[1]); // The star number that was hovered (1, 2, 3, 4, or 5)

		for(let i = 1; i <= ratingNumber; i++)
		{
			const star = document.getElementById(`${prefix}-${i}`) as HTMLImageElement;
			star.src = `empty_star.svg`;
		}

		this.SetRatingStar(questionNumber, this.surveyQuestions[questionNumber].answer.toString()); // Set the rating star to the current rating of the question
	}

	OnMouseClickRatingStar(event: MouseEvent)
	{
		const div = event.currentTarget as HTMLDivElement;
		const element = div.querySelector('img') as HTMLImageElement;

		const prefix = element.id.split('-')[0];
		const questionNumber = parseInt(prefix.split("question")[1]); // The question number (1, 2, 3, or 4... etc)
		const ratingNumber = parseInt(element.id.split('-')[1]); // The star number that was hovered (1, 2, 3, 4, or 5)

		this.surveyQuestions[questionNumber].answer = ratingNumber.toString(); // Set the current rating of the question to the rating number

		for(let i = 1; i <= ratingNumber; i++)
		{
			const star = document.getElementById(`${prefix}-${i}`) as HTMLImageElement;
			star.src = `full_star.svg`;
		}
	}

	SetRatingStar(questionNumber: number, ratingNumber: string)
	{
		this.QuestionUnsetAllStars(questionNumber);
		const prefix = `question${questionNumber}`; // The prefix of the question (question1, question2, question3, or question4... etc)

		this.surveyQuestions[questionNumber].answer = ratingNumber; // Set the current rating of the question to the rating number

		for(let i = 1; i <= parseInt(ratingNumber); i++)
		{
			const star = document.getElementById(`${prefix}-${i}`) as HTMLImageElement;
			star.src = `full_star.svg`;
		}
	}

	QuestionUnsetAllStars(questionNumber: number)
	{
		for(let i = 1; i <= this.surveyQuestions[questionNumber].starCount; i++)
		{
			const star = document.getElementById(`question${questionNumber}-${i}`) as HTMLImageElement;
			star.src = `empty_star.svg`;
		}
	}

	OnSurveySubmitButtonClicked()
	{
		if(this.allowSubmit === false)
		{
			return;
		}

		this.allowSubmit = false;

		const localURL = this.configService.getApiUrl() + "/survey";

		const headers = {
			'Content-Type': 'application/json'
		};

		var dataToSend = new SurveyData();
		dataToSend.surveyQuestions = this.surveyQuestions;
		dataToSend.surveyId = this.acitvatedRoute.snapshot.params['id'];

		//alert(dataToSend.surveyId);

		let gotAnError = false;

		this.http.post(localURL, dataToSend, { headers: headers, responseType: 'text' }).subscribe({
			next: (value: any) => {
				const message = value;

				if (message.includes("This survey has already been submitted")) {
					this.showErrorMessage = true;
					this.errorMessage = "לא ניתן לשלוח את הסקר. הסקר הזה כבר נשלח בעבר.";
					gotAnError = true;
					this.allowSubmit = true;
				} else {
					this.showErrorMessage = false;
					this.errorMessage = "אירעה שגיאה בעת שליחת הסקר. נסה שוב מאוחר יותר.";
					gotAnError = false;
					this.allowSubmit = true;
				}
				
			},
			error: (err) => {
				this.showErrorMessage = true;
				this.errorMessage = "אירעה שגיאה בעת שליחת הסקר. נסה שוב מאוחר יותר.";
				this.allowSubmit = true;

			},
			complete: () => {
				if(!gotAnError)
				{
					console.log("Finished submitting survey.");
					this.router.navigate(['/survey-thank-you']);
				}
			},
		});
	}

	OnTextAreaInputChanged(event: Event)
	{
		const textArea = event.target as HTMLTextAreaElement;

		this.surveyQuestions[5].answer = textArea.value;
	}
}