import { DOCUMENT, registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import en from '@angular/common/locales/en';
import vi from '@angular/common/locales/vi';
import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, inject, LOCALE_ID } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, RouteReuseStrategy, TitleStrategy, withComponentInputBinding, withHashLocation, withInMemoryScrolling, withPreloading, withViewTransitions } from '@angular/router';

import { DashboardOutline, FormOutline, MenuFoldOutline, MenuUnfoldOutline } from '@ant-design/icons-angular/icons';
import { appRoutes } from '@app/app-routing';
import interceptors from '@app/core/services/interceptors';
import { CustomPageTitleResolverService } from '@core/services/common/custom-page-title-resolver.service';
import { InitThemeService } from '@core/services/common/init-theme.service';
import { LoadAliIconCdnService } from '@core/services/common/load-ali-icon-cdn.service';
import { SimpleReuseStrategy } from '@core/services/common/reuse-strategy';
import { ScrollService } from '@core/services/common/scroll.service';
import { SelectivePreloadingStrategyService } from '@core/services/common/selective-preloading-strategy.service';
import { SubLockedStatusService } from '@core/services/common/sub-locked-status.service';
import { SubWindowWithService } from '@core/services/common/sub-window-with.service';
import { ThemeSkinService } from '@core/services/common/theme-skin.service';
import { StartupService } from '@core/startup/startup.service';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NZ_I18N, en_US, vi_VN } from 'ng-zorro-antd/i18n';
import { NZ_ICONS } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';

const icons = [MenuFoldOutline, MenuUnfoldOutline, DashboardOutline, FormOutline];

registerLocaleData(en);
registerLocaleData(vi);

export function StartupServiceFactory(startupService: StartupService) {
  return () => startupService.load();
}

export function LoadAliIconCdnFactory(loadAliIconCdnService: LoadAliIconCdnService) {
  return () => loadAliIconCdnService.load();
}

export function InitThemeServiceFactory(initThemeService: InitThemeService) {
  return async (): Promise<void> => await initThemeService.initTheme();
}

export function InitLockedStatusServiceFactory(subLockedStatusService: SubLockedStatusService) {
  return () => subLockedStatusService.initLockedStatus();
}

export function SubWindowWithServiceFactory(subWindowWithService: SubWindowWithService) {
  return () => subWindowWithService.subWindowWidth();
}

const APP_INIT_PROVIDERS = [
  {
    provide: APP_INITIALIZER,
    useFactory: StartupServiceFactory,
    deps: [StartupService],
    multi: true
  },
  {
    provide: APP_INITIALIZER,
    useFactory: LoadAliIconCdnFactory,
    deps: [LoadAliIconCdnService],
    multi: true
  },
  {
    provide: APP_INITIALIZER,
    useFactory: InitLockedStatusServiceFactory,
    deps: [SubLockedStatusService],
    multi: true
  },
  {
    provide: APP_INITIALIZER,
    useFactory: InitThemeServiceFactory,
    deps: [InitThemeService],
    multi: true
  },
  {
    provide: APP_INITIALIZER,
    useFactory: SubWindowWithServiceFactory,
    deps: [SubWindowWithService],
    multi: true
  },
  {
    provide: APP_INITIALIZER,
    useFactory: (themeService: ThemeSkinService) => () => {
      return themeService.loadTheme();
    },
    deps: [ThemeSkinService],
    multi: true
  }
];

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: RouteReuseStrategy, useClass: SimpleReuseStrategy, deps: [DOCUMENT, ScrollService] },
    {
      provide: TitleStrategy,
      useClass: CustomPageTitleResolverService
    },
    {
      provide: NZ_I18N,
      useFactory: () => {
        const localId = inject(LOCALE_ID);
        switch (localId) {
          case 'vi':
            return vi_VN;
          default:
            return en_US;
        }
      }
    },
    { provide: NZ_ICONS, useValue: icons },
    provideRouter(
      appRoutes,
      withPreloading(SelectivePreloadingStrategyService),
      withViewTransitions({
        skipInitialTransition: true
      }),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top'
      }),
      // withHashLocation(),
      withComponentInputBinding()
    ),
    importProvidersFrom(NzDrawerModule, NzModalModule),
    ...interceptors,
    ...APP_INIT_PROVIDERS,
    provideAnimationsAsync(), // Enable delayed loading animation, a new feature of ng17. If you want to load animation when the project starts, you can use provideAnimations()
    provideHttpClient(withInterceptorsFromDi())
  ]
};
