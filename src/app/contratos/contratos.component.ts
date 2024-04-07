import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GLOBAL } from '../services/GLOBAL';
import iziToast from 'izitoast';

export interface Propiedad{
  _id: string;
  ubicacion: string;
}

@Component({
  selector: 'app-contratos',
  templateUrl: './contratos.component.html',
  styleUrls: ['./contratos.component.css']
})

export class ContratosComponent {
  //url raiz
  public url: any;
  //lista de propiedades
  public propiedades: any = [];
  //contratos
  public contratos: any[] = [];
  public contratosRutas: any[] =[];
  public propiedadSeleccionada: Propiedad = {_id: '', ubicacion:''};
  public rutaContrato: string  = '';

  constructor(
    private _httpClient: HttpClient,
    private _router: Router,
    private _authService: AuthService
  ) {
    this.url = GLOBAL.url;
  }

  ngOnInit() {
    // Obtén el token Bearer desde tu servicio de autenticación (AuthService)
    const token = this._authService.getToken();

    // Verifica si el token está presente
    if (token) {
      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      });

      this._httpClient
        .get(this.url + 'propiedades/lista', { headers: headers })
        .subscribe(
          (response) => {
            this.propiedades = response;
            console.log(this.propiedades);
          },
          (error) => {
            if(error.error.error){
              iziToast.show({
                titleColor: '#FF0000',
                title: 'ERROR',
                class: 'text-danger',
                position: 'topRight',
                message: error.error.error
              });  
            }else{
              iziToast.show({
                titleColor: '#FF0000',
                title: 'ERROR',
                class: 'text-danger',
                position: 'topRight',
                message: error.message
              });  
            }
          }
        );
    } else {
      iziToast.show({
        titleColor: '#FF0000',
        title: 'ERROR',
        class: 'text-danger',
        position: 'topRight',
        message: 'Token no disponible. Usuario no autenticado.'
      });
    }
  }

  buscarContratos(){
    this.contratos = [];

    if (!this.propiedadSeleccionada) {
      console.error('Por favor, seleccione una propiedad.');
      return;
    }
    const token = this._authService.getToken();
    if (token) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      });
      
      // Realiza la solicitud HTTP utilizando la propiedad seleccionada
      this._httpClient
        .get(this.url + `propiedades/lista/s3/${this.propiedadSeleccionada._id}`, { headers: headers })
        .subscribe(
          (response: any) => {
            this.contratosRutas = response;
            response.forEach((element: string) => {
              const fileName = element?.split("/").pop()?.split(".")[0];
              if (fileName) {
                this.contratos.push(fileName);
              }
            });     
          },
          (error) => {
            if(error.error.error){
              iziToast.show({
                titleColor: '#FF0000',
                title: 'ERROR',
                class: 'text-danger',
                position: 'topRight',
                message: error.error.error
              });  
            }else{
              iziToast.show({
                titleColor: '#FF0000',
                title: 'ERROR',
                class: 'text-danger',
                position: 'topRight',
                message: error.message
              });
              console.error('Error en la solicitud:', error);
            }
          }
        );
    }
  }
  

  actualizarPropiedadSeleccionado(): void {
    const selectElement = document.getElementById('selectPropiedad') as HTMLSelectElement;
    const selectedOption = selectElement.value;
    this.propiedades.forEach((propiedad : Propiedad) => {
      if (propiedad.ubicacion === selectedOption){
        this.propiedadSeleccionada = propiedad;
      }
    });
  }

  descargarContrato(event: MouseEvent): void{
    // Obtén el token Bearer desde tu servicio de autenticación (AuthService)
    const token = this._authService.getToken();
    // Verifica si el token está presente
    if (token) {
      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      });

      const cardSeleccionado = event.target as HTMLElement;
      const arrendatario = cardSeleccionado.textContent;
      this.contratosRutas.forEach(ruta => {
        if(ruta.split('/').pop()?.split(".")[0] == arrendatario){
          this.rutaContrato = ruta.split('.').shift();
        }
      });
      
      this._httpClient
        .get(this.url + `propiedades/descargar/s3/${this.rutaContrato}`, { headers: headers, responseType: 'blob' as 'json' })
        .subscribe(
          (response: any) => {
            // Crea un objeto Blob con los datos recibidos del servidor
            const blob = new Blob([response], { type: 'application/pdf' });

            // Crea un objeto URL para el Blob
            const url = window.URL.createObjectURL(blob);

            // Crea un enlace <a> para descargar el PDF
            const link = document.createElement('a');
            link.href = url;
            link.download = 'contrato.pdf'; // Nombre del archivo PDF
            document.body.appendChild(link);

            // Simula el clic en el enlace para iniciar la descarga
            link.click();

            // Libera el objeto URL una vez que se ha iniciado la descarga
            window.URL.revokeObjectURL(url);
            
            iziToast.show({
              titleColor: '#46bd22cc',
              title: 'Exito',
              class: 'text-success',
              position: 'topRight',
              message: 'Contrato descargado',
            });
          },
          (error) => {
            if(error.error.error){
              iziToast.show({
                titleColor: '#FF0000',
                title: 'ERROR',
                class: 'text-danger',
                position: 'topRight',
                message: error.error.error
              });  
            }else{
              iziToast.show({
                titleColor: '#FF0000',
                title: 'ERROR',
                class: 'text-danger',
                position: 'topRight',
                message: error.message
              });
              console.error('Error al descargar contrato de S3:', error);
            }
          }
        );
    } else {
      iziToast.show({
        titleColor: '#FF0000',
        title: 'ERROR',
        class: 'text-danger',
        position: 'topRight',
        message: 'Token no disponible. Usuario no autenticado.'
      });
    }
  }
}
