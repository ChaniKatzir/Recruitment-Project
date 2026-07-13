import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function phoneOrEmailOrAddressValidator(): ValidatorFn
{
    return (control: AbstractControl): ValidationErrors | null => 
    {
        const phone = control.get('phoneNumber')?.value;
        const email = control.get('email')?.value;
        const address = control.get('address')?.value;
        const city = control.get('city')?.value;
        const zipCode = control.get('zipCode')?.value;

        console.log('Logging fields:', phone, email, address, city, zipCode);

        if (!phone && !email && (!address || !zipCode || !city) )
        {
            return { phoneOrEmailOrAddress: true };
        }

        return null;
    }
}