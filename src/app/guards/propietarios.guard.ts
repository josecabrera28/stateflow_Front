import { CanActivateFn } from '@angular/router';
import { AuthService } from "../../app/services/auth.service";
import { Router } from "@angular/router";
import { inject } from '@angular/core';

export const propietariosGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const _router = inject(Router);
  if(!authService.isAuthenticate(['propietario'])){
    _router.navigate(['/login']);
    return false;
  }
  return true;
};
