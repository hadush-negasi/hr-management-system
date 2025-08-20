// src/app/shared/pipes/initials.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials'
})
export class InitialsPipe implements PipeTransform {
  transform(name: string | undefined): string {
    if (!name) return '';

    // Split name into parts and get first letters
    const parts = name.split(' ');
    let initials = '';
    
    // Get first letter of first part
    if (parts[0]) {
      initials += parts[0][0].toUpperCase();
    }
    
    // Get first letter of last part (if different from first part)
    if (parts.length > 1 && parts[parts.length - 1]) {
      initials += parts[parts.length - 1][0].toUpperCase();
    }
    
    return initials;
  }
}