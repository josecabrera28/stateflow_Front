import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { propietariosGuard } from "../app/guards/propietarios.guard";
import { RegistroComponent } from './registro/registro.component';
import { ReportesComponent } from './reportes/reportes.component';
import { ContratosComponent } from './contratos/contratos.component';
import { LandingComponent } from './components/landing/landing.component';

const routes: Routes = [{
  path: 'landing',
  component: LandingComponent
},{
  path: 'home',
  component: HomeComponent,
  canActivate: [propietariosGuard]
},{
  path: '',
  redirectTo: '/home',
  pathMatch: 'full'
},{
  path: 'reportes',
  component: ReportesComponent,
  canActivate: [propietariosGuard]
},{
  path: 'contratos',
  component: ContratosComponent,
  canActivate: [propietariosGuard]
},{
  path: 'login',
  component: LoginComponent
},{
  path: 'registro',
  component: RegistroComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
