import { Routes } from '@angular/router';
import { MainFormComponent } from './main-form/main-form.component';
import { ContactTypeComponent } from './contact-type/contact-type.component';
import { ContactDetailsComponent } from './contact-details/contact-details.component';
import { ContactorDetailsComponent } from './contactor-details/contactor-details.component';
import { DocumentUploadComponent } from './document-upload/document-upload.component';
import { SummaryComponent } from './summary/summary.component';
import { FinishedComponent } from './finished/finished.component';
import { SurveyPageComponent } from './survey-page/survey-page.component';
import { SurveyThankYouComponent } from './survey-thank-you/survey-thank-you.component';

export const routes: Routes = 
[
    {
        path: '',
        component: MainFormComponent,
        children: 
        [
            { path: '', component: ContactTypeComponent },
            { path: 'step2', component: ContactorDetailsComponent, },
            { path: 'step3', component: ContactDetailsComponent },
            { path: 'step4', component: DocumentUploadComponent },
            { path: 'step5', component: SummaryComponent },
            { path: 'done', component: FinishedComponent }
        ]
    },
    { path: 'survey/:id', component: SurveyPageComponent },
    { path: 'survey-thank-you', component: SurveyThankYouComponent }
];