import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import iziToast from 'izitoast';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{

  public user: any = { };
  public token: any = '';

  constructor(private _auth: AuthService, private _router: Router){
    this.token = this. _auth.getToken();
  }

  ngOnInit(): void{
    console.log(this.token);
    if(this.token){
      this._router.navigate(['/']);
    }
  }

  login(loginForm: { valid: any; }){
    if(loginForm.valid){

      let data = {
        email: this.user.email,
        contraseña: this.user.password
      }
      this._auth.login(data).subscribe(
        response=>{
          if(response.message){
            iziToast.show({
              titleColor: '#FF0000',
              title: 'ERROR',
              class: 'text-danger',
              position: 'topRight',
              message: response.message
            });  
          }else{
            console.log(response);
            sessionStorage.setItem('token',response.token);
            sessionStorage.setItem('_id',response.usuario._id);
            this._router.navigate(['/']);
          }
        },error=>{
          iziToast.show({
            titleColor: '#FF0000',
            title: 'ERROR',
            class: 'text-danger',
            position: 'topRight',
            message: error.message
          });
        }
      );
    }else{
      iziToast.show({
        titleColor: '#FF0000',
        title: 'ERROR',
        class: 'text-danger',
        position: 'topRight',
        message: 'los datos del formulario no son validos'
      });
    }
  }
}
