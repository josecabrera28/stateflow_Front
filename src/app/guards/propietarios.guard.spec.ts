import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { propietariosGuard } from './propietarios.guard';

describe('propietariosGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => propietariosGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
