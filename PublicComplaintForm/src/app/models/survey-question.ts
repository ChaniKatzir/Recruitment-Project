export class SurveyQuestion 
{
    question: string = '';
    answer: string = '';
    isFreeText: boolean = false;
    multipleSelection: boolean = false;
    options: string[] = [];
    starCount: number = 0; // Optional, used for star rating questions
}