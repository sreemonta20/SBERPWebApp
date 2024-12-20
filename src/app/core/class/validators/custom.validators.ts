import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// export class CustomValidators {
//   static patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
//     return (control: AbstractControl) => {
//       if (!control.value) {
//         return null;
//       }
//       const valid = regex.test(control.value);
//       return valid ? null : error;
//     };
//   }
// }

export class CustomValidators {
  static englishText(minLength: number, maxLength: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;

      // Check if empty or whitespace
      if (!value || !value.trim()) {
        return { 'englishText': 'Input is empty or whitespace' };
      }

      // Check for special characters or numbers
      const englishTextRegex = /^[A-Za-z ]+$/;
      if (!englishTextRegex.test(value)) {
        return { 'englishText': 'Input contains non-English characters or numbers' };
      }

      // Check length constraints
      if (value.length < minLength || value.length > maxLength) {
        return { 'englishText': `Input must be between ${minLength} and ${maxLength} characters` };
      }

      return null;
    };
  }

  static number(minLength: number, maxLength: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;

      // Check if value is a number
      if (isNaN(value)) {
        return { 'number': 'Input is not a number' };
      }

      // Check length constraints
      const valueLength = value.toString().length;
      if (valueLength < minLength || valueLength > maxLength) {
        return { 'number': `Number must be between ${minLength} and ${maxLength} digits` };
      }

      return null;
    };
  }

  static uniqueIdentifier(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;

      // Check if the value is valid (allows English text, numbers, and hyphens)
      const regex = /^[a-zA-Z0-9-]+$/;
      if (!regex.test(value)) {
        return { 'englishTextNumberHyphen': 'Only English text, numbers, and hyphens are allowed' };
      }

      return null;
    };
  }
}