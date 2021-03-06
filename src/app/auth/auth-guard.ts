import { Injectable }             from '@angular/core';
import { CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot }    from '@angular/router';
import { AuthService }            from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(public authService: AuthService, private router: Router) { }

  canActivate(
    // Not using but worth knowing about
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    if (this.authService.check()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;

  }
}
