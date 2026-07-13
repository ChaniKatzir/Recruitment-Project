import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-custom-radio-button',
	imports: [CommonModule],
	templateUrl: './custom-radio-button.component.html',
	styleUrl: './custom-radio-button.component.scss'
})

export class CustomRadioButtonComponent 
{
	@Input() optionsList: string[] = ['כן', 'לא'];
    @Input() selectedOption: string | undefined;
    
    @Output() selectedOptionEvent = new EventEmitter<string>();

	Clicked(index: number)
    {
        for(let i = 0; i < this.optionsList.length; i++)
        {
            var radio = document.getElementById(i.toString() + "-radio") as HTMLDivElement;

            if(i === index)
            {
                radio.classList.add('selected-radio-button');
                this.selectedOptionEvent.emit(this.optionsList[index]);
            }

            else radio.classList.remove('selected-radio-button');
        }
    }
}
