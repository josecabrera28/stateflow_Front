import { Injectable } from '@angular/core';
import { GLOBAL } from "./GLOBAL";
import { Observable } from "rxjs";
import { JwtHelperService } from "@auth0/angular-jwt";
import { HttpClient, HttpHeaders } from "@angular/common/http";
@Injectable({
  providedIn: 'root'
})
export class AuthService {

      public url: any;

  constructor(private _http: HttpClient, public jwtHelper: JwtHelperService) { 
    this.url = GLOBAL.url;
  }

  login(data:any):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.post(this.url+'usuarios/login',data,{headers: headers});
  }

  getToken(){
    return sessionStorage.getItem('token');
  }

  isAuthenticate(allowedRoles: string[]){
    console.log("entrando a authenticate");
    const token = sessionStorage.getItem('token');
    if(!token){
      return false;
    }
    try {
      var decodedToken = this.jwtHelper.decodeToken(token); 
      if(!decodedToken){
        sessionStorage.removeItem('token');
        return false;
      }        
    } catch (error) {
      sessionStorage.removeItem('token');
      return false;
    }
    return allowedRoles.includes(decodedToken.rol);
  }

  registrarUsuario(data:any):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.post(this.url+'usuarios/registro',data,{headers: headers});
  }
}
