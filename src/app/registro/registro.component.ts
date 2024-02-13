import { Component, OnInit } from '@angular/core';
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";

declare var iziToast: any;

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
      console.log(usuario);
      this._auth.registrarUsuario(usuario).subscribe(
        response=>{
          try {
            if(response.message){
              iziToast.show({
                titleColor: '#FF0000',
                title: 'ERROR',
                clas: 'text-danger',
                position: 'topRight',
                message: response.message
              });  
            }
            if(response.token){
              console.log(response);
              this._router.navigate(['login']);
            }
              
          } catch (error) {
            iziToast.show({
              titleColor: '#FF0000',
              title: 'ERROR',
              clas: 'text-danger',
              position: 'topRight',
              message: response.message
            });
          }
        },error=>{
          iziToast.show({
            titleColor: '#FF0000',
            title: 'ERROR',
            clas: 'text-danger',
            position: 'topRight',
            message: error.message
          });
        }
      );
    }else{
      iziToast.show({
        titleColor: '#FF0000',
        title: 'ERROR',
        clas: 'text-danger',
        position: 'topRight',
        message: 'Formulario no valido'
      });
    }
  }
}
