import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import iziToast from 'izitoast';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-display-properties',
  templateUrl: './display-properties.component.html',
  styleUrls: ['./display-properties.component.css'],
})
export class DisplayPropertiesComponent {
  //url raiz
  public url: any;
  //lista de propiedades
  public propiedades: any = [];
  public tipo: any;
  public ubicacion: any;
  public m2: Number = 0;
  public cuartos: Number = 1;
  public parqueaderos: Number = 0;
  public gastos: any[] = [];
  //propiedad seleccionada
  public _id_i: any;
  public tipo_i: any;
  public ubicacion_i: any;
  public m2_i: Number = 0;
  public cuartos_i: Number = 1;
  public parqueaderos_i: Number = 0;
  public ingresos: any = { arriendos: [] };
  public currentTab: string = 'info';
  public arriendos: any[] = [];
  public selectedArriendo: any; //tab arrendatarios
  //Ingresos y Egresos
  public ano: any;
  public mes: any;
  public servicio_Agua: number = 0;
  public servicio_Energia: number = 0;
  public servicio_Gas: number = 0;
  public servicio_Internet: number = 0;
  public servicio_Administracion: number = 0;
  public servicio_Credito: number = 0;
  //Arrendatarios
  public nuevoArrendatario: any = {};

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
            console.error('Error en la solicitud:', error);
          }
        );
    } else {
      console.error('Token no disponible. Usuario no autenticado.');
    }
  }

  truncateLastFourDigits(value: string | undefined): string | undefined {
    if (value) {
      const length = value.length;
      return length > 4 ? value.substring(length - 4) : value;
    }
    return value;
  }

  nuevaPropiedad(dataPropiedad: { valid: any }) {
    // Obtén el token Bearer desde tu servicio de autenticación (AuthService)
    const token = this._authService.getToken();

    // Verifica si el token está presente
    if (token) {
      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      });

      // Construye el objeto con la información del formulario
      const body = {
        tipo: this.tipo,
        ubicacion: this.ubicacion,
        m2: this.m2,
        cuartos: this.cuartos,
        parqueaderos: this.parqueaderos,
        gastos: this.gastos,
        ingresos: this.ingresos,
      };

      if (this.tipo != 'casa' && this.tipo != 'apartamento') {
        iziToast.show({
          titleColor: '#FF0000',
          title: 'ERROR',
          class: 'text-danger',
          position: 'topRight',
          message: 'Elige el tipo de propiedad entre casa o apartamento',
        });
        return;
      } else if (this.ubicacion == null || this.ubicacion == undefined) {
        iziToast.show({
          titleColor: '#FF0000',
          title: 'ERROR',
          class: 'text-danger',
          position: 'topRight',
          message: 'Escribe la direccion de tu propiedad en el campo ubicacion',
        });
        return;
      } else {
        //Envia peticion y maneja la respuesta
        this._httpClient
          .post(this.url + 'propiedades/nueva', body, { headers: headers })
          .subscribe(
            (response) => {
              iziToast.show({
                titleColor: '#46bd22cc',
                title: 'Exito',
                class: 'text-success',
                position: 'topRight',
                message: 'Propieadad Creada',
              });
              //Actualiza la informacion de las propiedades
              this.ngOnInit();
              //limpia el formulario
              this.tipo = '';
              this.ubicacion = '';
              this.m2 = 0;
              this.cuartos = 0;
              this.parqueaderos = 0;
              this.gastos = [];
              this.ingresos = { arriendos: [] };
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
                  message: error.message,
                });
                console.error('Error en la solicitud:', error);  
              }
              this.tipo = '';
              this.ubicacion = '';
              this.m2 = 0;
              this.cuartos = 1;
              this.parqueaderos = 0;
              this.gastos = [];
              this.ingresos = { arriendos: [] };
            }
          );
      }
    } else {
      iziToast.show({
        titleColor: '#FF0000',
        title: 'ERROR',
        class: 'text-danger',
        position: 'topRight',
        message: 'No token. Usuario no autenticado.'
      });  
    }
  }

  eliminarPropiedad(_id: string): void {
    const token = this._authService.getToken();

    try {
      if (token) {
        let headers = new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        });
        this._httpClient
          .delete(this.url + `propiedades/${_id}`, { headers: headers })
          .subscribe(
            (response) => {
              iziToast.show({
                titleColor: '#46bd22cc',
                title: 'Éxito',
                class: 'text-success',
                position: 'topRight',
                message: 'Propiedad eliminada con éxito',
              });
              //Actualiza la informacion de las propiedades
              this.ngOnInit();
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
              } else{
                iziToast.show({
                  titleColor: '#FF0000',
                  title: 'ERROR',
                  class: 'text-danger',
                  position: 'topRight',
                  message: error.message,
                });
                console.error('Error en la solicitud:', error);
              }
            }
          );
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  }

  adminPropiedad(propiedad: any): void {
    this._id_i = propiedad._id;
    this.tipo_i = propiedad.tipo;
    this.ubicacion_i = propiedad.ubicacion;
    this.m2_i = propiedad.m2;
    this.cuartos_i = propiedad.cuartos;
    this.parqueaderos_i = propiedad.parqueaderos;
    this.arriendos = propiedad.ingresos.arriendos;
    this.selectedArriendo = this.arriendos[0];
    console.log(this.selectedArriendo);
    console.log(this.arriendos);
  }

  showTab(tab: string, event: Event): void {
    event.preventDefault(); // Evitar la propagación del evento
    this.currentTab = tab;
  }

  isTabActive(tab: string): boolean {
    return this.currentTab === tab;
  }

  actualizarPrecio(index: number, _id: any) {
    // Obtén el token Bearer desde tu servicio de autenticación (AuthService)
    const nuevoPrecio = document.querySelectorAll('input.nuevoPrecio');
    const body = { precio: (nuevoPrecio[index] as HTMLInputElement).value };
    const token = this._authService.getToken();
    // Verifica si el token está presente
    if (token) {
      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      });
      this._httpClient
        .put<any>(this.url + `propiedades/precio/${this._id_i}/${_id}`, body, {
          headers: headers,
        })
        .subscribe(
          (response) => {
            if (response._id) {
              console.log('respuesta ok');
              iziToast.show({
                titleColor: '#46bd22cc',
                title: 'Éxito',
                class: 'text-success',
                position: 'topRight',
                message: 'Arriendo actualizado con éxito',
              });
              //Actualiza el precio actual de los arriendos
              this.ngOnInit();
              const nuevoPrecio = document.querySelectorAll(
                'td.precioActual'
              ) as NodeListOf<HTMLInputElement>;
              nuevoPrecio[
                index
              ].innerHTML = `<strong>$</strong> ${response.precio}`;
              return;
            }
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
    } else {
      console.error('Token no disponible. Usuario no autenticado.');
    }
  }

  deshabilitarBotones(index: number) {
    let filas = document.querySelectorAll('tr.identificador');
    let todosLosInputsVacios = true;

    filas.forEach((fila, i) => {
      const inputEnFila = fila.querySelector('input');
      const botonEnFila = fila.querySelector('button');

      // Habilita o deshabilita el botón según si es la fila actual
      if (i !== index) {
        botonEnFila?.setAttribute('disabled', 'true');
        inputEnFila?.setAttribute('disabled', 'true');
      } else {
        botonEnFila?.removeAttribute('disabled');
        inputEnFila?.removeAttribute('disabled');
      }

      // Verifica si algún input tiene valor
      if (inputEnFila?.value.trim() !== '') {
        todosLosInputsVacios = false;
      }
    });

    // Restablece todos los botones e inputs si todos los inputs están vacíos
    if (todosLosInputsVacios) {
      filas.forEach((fila) => {
        const inputEnFila = fila.querySelector('input');
        const botonEnFila = fila.querySelector('button');

        botonEnFila?.removeAttribute('disabled');
        inputEnFila?.removeAttribute('disabled');
        if (inputEnFila) {
          inputEnFila.value = ''; // Restablece el valor del input
        }
      });
    }
  }

  ingresarRegistro(): void {
    // Obtén el token Bearer desde tu servicio de autenticación (AuthService)
    const token = this._authService.getToken();

    const body = {
      año: parseInt(this.ano),
      mes: parseInt(this.mes),
      servicios: {
        energia: this.servicio_Energia,
        gas: this.servicio_Gas,
        agua: this.servicio_Agua,
        internet: this.servicio_Internet,
        administracion: this.servicio_Administracion,
      },
      credito: {
        esCredito: Boolean,
        monto: Number,
        plazo: Number,
        tasa: Number,
        cuota: this.servicio_Credito,
      },
    };
    //Verifica si el token está presente
    if (token) {
      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      });
      this._httpClient
        .post<any>(this.url + `propiedades/${this._id_i}/nuevogasto`, body, {
          headers: headers,
        })
        .subscribe(
          (response) => {
            if (response.ingresos) {
              iziToast.show({
                titleColor: '#46bd22cc',
                title: 'Éxito',
                class: 'text-success',
                position: 'topRight',
                message: 'Registro Ingresado',
              });
              //Actualiza el precio actual de los arriendos
              this.ngOnInit();
              this.ano = 0;
              this.mes = 0;
              this.servicio_Agua = 0;
              this.servicio_Energia = 0;
              this.servicio_Gas = 0;
              this.servicio_Internet = 0;
              this.servicio_Administracion = 0;
              this.servicio_Credito = 0;
              return;
            }
          },
          (error) => {
            if (error.error.errors) {
              for (const item of error.error.errors) {
                iziToast.show({
                  titleColor: '#FF0000',
                  title: 'ERROR',
                  class: 'text-danger',
                  position: 'topRight',
                  message: item.path + '-' + item.message,
                });
              }
            } else if (error.error) {
              iziToast.show({
                titleColor: '#FF0000',
                title: 'ERROR',
                class: 'text-danger',
                position: 'topRight',
                message: error.error.error,
              });
            } else {
              iziToast.show({
                titleColor: '#FF0000',
                title: 'ERROR',
                class: 'text-danger',
                position: 'topRight',
                message: error.message,
              });
            }

            this.ano = 0;
            this.mes = 0;
            this.servicio_Agua = 0;
            this.servicio_Energia = 0;
            this.servicio_Gas = 0;
            this.servicio_Internet = 0;
            this.servicio_Administracion = 0;
            this.servicio_Credito = 0;
            console.error('Error en la solicitud:', error);
          }
        );
    } else {
      console.error('Token no disponible. Usuario no autenticado.');
    }
  }

  onArriendoChange(arriendo: any): void {
    console.log('Arriendo seleccionado:', arriendo);
  }

  agregarArrendatario(selectedArriendo: any) {
    // Obtén el token Bearer desde tu servicio de autenticación (AuthService)
    const token = this._authService.getToken();

    // Verifica si el token está presente
    if (token) {
      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      });

      // Construye el objeto con la información del formulario
      const body = {
        id_rol: 'arrendatario',
        nombre: this.nuevoArrendatario.nombre,
        apellido: this.nuevoArrendatario.apellido,
        edad: parseInt(this.nuevoArrendatario.edad),
        email: this.nuevoArrendatario.email,
      };
      if (
        this.nuevoArrendatario.nombre == undefined ||
        this.nuevoArrendatario.nombre == null ||
        this.nuevoArrendatario.apellido == undefined ||
        this.nuevoArrendatario.apellido == null ||
        this.nuevoArrendatario.edad == undefined ||
        this.nuevoArrendatario.edad == null ||
        this.nuevoArrendatario.edad <= 0 ||
        this.nuevoArrendatario.email == undefined ||
        this.nuevoArrendatario.email == null
      ) {
        iziToast.show({
          titleColor: '#FF0000',
          title: 'ERROR',
          class: 'text-danger',
          position: 'topRight',
          message: 'diligencia el formulario completamente',
        });
        this.nuevoArrendatario = {};
        return;
      }
      //Envia peticion y maneja la respuesta
      this._httpClient
        .put(
          this.url +
            `propiedades/adicionararrendatario/${this._id_i}/${selectedArriendo.arriendoId._id}`,
          body,
          { headers: headers, responseType: 'blob' as 'json' }
        )
        // Maneja errores de la petición HTTP
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
            //link.click();

            // Libera el objeto URL una vez que se ha iniciado la descarga
            window.URL.revokeObjectURL(url);
            
            iziToast.show({
              titleColor: '#46bd22cc',
              title: 'Exito',
              class: 'text-success',
              position: 'topRight',
              message: 'Arrendatario Creado',
            });
            //Actualiza la informacion de las propiedades
            this.ngOnInit();
            //limpia el formulario
            this.nuevoArrendatario = {};
          },
          (error) => {
            iziToast.show({
              titleColor: '#FF0000',
              title: 'ERROR',
              class: 'text-danger',
              position: 'topRight',
              message: error,
            });
            iziToast.show({
              titleColor: '#FF0000',
              title: 'ERROR',
              class: 'text-danger',
              position: 'topRight',
              message: error.error.error,
            });
            console.error('Error en la solicitud:', error);
            this.nuevoArrendatario = {};
          }
        );
    } else {
      console.error('Token no disponible. Usuario no autenticado.');
    }
    this.nuevoArrendatario = {};
  }

  removerArrendatario(selectedArriendo: any) {
    // Obtén el token Bearer desde tu servicio de autenticación (AuthService)
    const token = this._authService.getToken();

    // Verifica si el token está presente
    if (token) {
      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      });
      //Envia peticion y maneja la respuesta
      this._httpClient
        .put(
          this.url +
            `propiedades/removerarrendatario/${this._id_i}/${selectedArriendo.arriendoId._id}`,
          {},
          { headers: headers }
        )
        .subscribe(
          (response) => {
            iziToast.show({
              titleColor: '#46bd22cc',
              title: 'Exito',
              class: 'text-success',
              position: 'topRight',
              message: 'Arrendatario Removido',
            });
            //Actualiza la informacion de las propiedades
            this.ngOnInit();
            //limpia el formulario
            this.nuevoArrendatario = {};
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
                message: error.message,
              });
              console.error('Error en la solicitud:', error);
              this.nuevoArrendatario = {};
            }
          }
        );
    } else {
      console.error('Token no disponible. Usuario no autenticado.');
    }
    this.nuevoArrendatario = {};
  }
}
