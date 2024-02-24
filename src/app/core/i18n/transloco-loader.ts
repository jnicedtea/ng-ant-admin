import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { of } from 'rxjs';

import { EN } from '@core/i18n/en';
import { VI } from '@core/i18n/vi';
import { TranslocoLoader } from '@ngneat/transloco';

@Injectable({ providedIn: 'root' })
export class TranslocoLocalLoader implements TranslocoLoader {
  private http = inject(HttpClient);

  // Nginx Nasxi sometimes blocks request json files
  getTranslation(lang: string) {
    if (lang === 'vi') {
      return of(VI);
    }
    return of(EN);
  }
}
