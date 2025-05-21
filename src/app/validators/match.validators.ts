import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchValidator(controlName: string, matchingControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const controlValue = control.get(controlName)?.value;
    const matchingControlValue = control.get(matchingControlName)?.value;

    if (controlValue !== matchingControlValue) {
      control.get(matchingControlName)?.setErrors({ mustMatch: true });
      return { mustMatch: true };
    } else {
      control.get(matchingControlName)?.setErrors(null);
    }

    return null;
  };
}
