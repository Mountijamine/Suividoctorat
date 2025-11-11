import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { APP_ROUTER_PROVIDERS } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthService } from './services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
  provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    ...APP_ROUTER_PROVIDERS,
    // Ensure auth cookie fallback is set on app startup so no component needs to set it manually
    {
      provide: APP_INITIALIZER,
      useFactory: (auth: AuthService) => {
        return () => {
          try {
            // clear expired tokens and set cookie for existing token
            try { auth.logoutIfExpired(); } catch (e) {}
            try { auth.setCookieFallback(auth.getToken()); } catch (e) {}
          } catch (e) { /* ignore */ }
        };
      },
      deps: [AuthService],
      multi: true
    }
  ]
};
