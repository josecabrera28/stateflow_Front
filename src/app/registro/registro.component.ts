import { Component, OnInit } from '@angular/core';
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";
import { timeout } from 'rxjs/operators';
import iziToast from 'izitoast';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  
  public id_rol: string = 'propietario'; 
  public nombre:string = '';
  public apellido: string = '';
  public edad: number =0;
  public email: string = '';
  public password: string = '';

  constructor(private _auth: AuthService, private _router: Router){

  }
  ngOnInit():void{

  }
  registrar(registroForm: any){
    if(registroForm.valid){
      let usuario = {
        id_rol: this.id_rol,
        nombre: this.nombre,
        apellido: this.apellido,
        edad: this.edad,
        email: this.email,
        contraseña: this.password
      }
      this._auth.registrarUsuario(usuario).pipe(
        timeout(10000) // 10 sec timeout
      ).subscribe(
        response=>{
          if(response.message){
            iziToast.show({
              titleColor: 'black',
              backgroundColor: '#FF0000',
              color: 'red',
              title: 'Error',
              position: 'topRight',
              message: response.message,
              theme: 'light', 
              iconColor: 'white', 
              layout: 1,
            });  
          }
          if(response.token){
            iziToast.show({
              titleColor: 'black',
              backgroundColor: 'green',
              title: 'Éxito',
              position: 'topRight',
              message: 'Se ha creado su cuenta',
              theme: 'light', 
              color: 'green', 
              iconColor: 'white', 
              layout: 1,
            });  
            this._router.navigate(['login']);
          }
        },error=>{
          if (error.name === 'TimeoutError') {
            iziToast.show({
              titleColor: '#FF0000',
              title: 'ERROR',
              class: 'text-danger',
              position: 'topRight',
              message: 'La solicitud ha tomado demasiado tiempo, por favor inténtelo de nuevo.'
            });
          }else if(error.error.errors && Array.isArray(error.error.errors)){
            error.error.errors.forEach((err: any) => {
              iziToast.show({
                titleColor: 'black',
                backgroundColor: '#FF0000',
                color: 'red',
                title: 'Error',
                position: 'topRight',
                message: err.msg, 
                theme: 'light',
                iconColor: 'white',
                layout: 1,
              });
            });  
          }else{
            iziToast.show({
              titleColor: '#FF0000',
              title: 'ERROR',
              class: 'text-danger',
              position: 'topRight',
              message: error.error.message
            });
          }
        }
      );
    }else{
      console.log(this.password);
      console.log(this.email);
      iziToast.show({
        titleColor: '#FF0000',
        title: 'ERROR',
        class: 'text-danger',
        position: 'topRight',
        message: 'Formulario no valido'
      });
    }
  }
}
