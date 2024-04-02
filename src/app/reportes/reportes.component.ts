import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GLOBAL } from '../services/GLOBAL';
import * as d3 from 'd3';
import iziToast from 'izitoast';

// Define un tipo para los gastos unificados
interface GastosUnificados {
  [key: number]: number;
}
export interface Propiedad {
  _id: string;
  ubicacion: string;
}
@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css'],
})
export class ReportesComponent {
  //url raiz
  public url: any;
  //lista de propiedades
  public propiedades: any = [];
  public propiedadSeleccionada: Propiedad = { _id: '', ubicacion: '' };
  public anoSeleccionado: Number = 2020;
  public anos: any = [];
  //ingresos
  public ingresos: any = {};
  public gastos: any = {};

  constructor(
    private _router: Router,
    private _httpClient: HttpClient,
    private _authService: AuthService
  ) {
    this.url = GLOBAL.url;
  }

  ngOnInit() {
    // Obtén el token Bearer desde tu servicio de autenticación (AuthService)
    const token = this._authService.getToken();

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
            this.propiedadSeleccionada = this.propiedades[0];
          },
          (error) => {
            console.error('Error en la solicitud:', error);
          }
        );
    } else {
      console.error('Token no disponible. Usuario no autenticado.');
    }
    for (let index = 2020; index <= 2040; index++) {
      this.anos.push(index);
    }
  }

  actualizarPropiedadSeleccionado(): void {
    const selectElement = document.getElementById(
      'selectPropiedad'
    ) as HTMLSelectElement;
    const selectedOption = selectElement.value;
    this.propiedades.forEach((propiedad: Propiedad) => {
      if (propiedad.ubicacion === selectedOption) {
        this.propiedadSeleccionada = propiedad;
      }
    });
  }

  async generarReportes() {
    const token = this._authService.getToken();
    if (token) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      });
  
      try {
        const ingresosPromise = this._httpClient.get(
          `${this.url}propiedades/listaingresos/${this.propiedadSeleccionada._id}/${this.anoSeleccionado}`,
          { headers: headers }
        ).toPromise();
  
        const gastosPromise = this._httpClient.get(
          `${this.url}propiedades/listagastos/${this.propiedadSeleccionada._id}/${this.anoSeleccionado}`,
          { headers: headers }
        ).toPromise();
  
        this.ingresos = await ingresosPromise;
        this.gastos = await gastosPromise;
  
        this.generarGraficoBarras(this.ingresos, this.gastos);
      } catch (error) {
        iziToast.show({
          titleColor: 'black',
          backgroundColor: '#FF0000',
          color: 'red',
          title: 'Error',
          position: 'topRight',
          message: 'Error al generar reporte',
          theme: 'light', 
          iconColor: 'white', 
          layout: 1,
        });  
        console.error('Error al generar reportes:', error);
      }
    }
  }

  generarGraficoBarras(ingresos: any, gastos:any ) {
    console.log(ingresos);
    console.log(gastos);
    // Crear un array con objetos para cada mes que contenga información de ingresos y gastos
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const gastosUnificados : GastosUnificados = this.unificarGastos(gastos);
    const datosMeses = meses.map((mes, i) => ({
        mes,
        ingreso: ingresos[i+1] || 0,
        gasto: gastosUnificados[i] || 0
    }));
    console.log(datosMeses);
    // Calcular el valor máximo entre ingresos y gastos para ajustar el rango del eje y
    const maxValue = Math.max(
        Math.max(...datosMeses.map(d => d.ingreso)),
        Math.max(...datosMeses.map(d => d.gasto))
    );

    // Limpiar el contenido existente del contenedor del gráfico
    d3.select('#grafico-barras').selectAll('*').remove();

    // Configurar dimensiones del gráfico
    const svgWidth = 700;
    const svgHeight = 400;
    const margin = { top: 50, right: 20, bottom: 30, left: 100 };

    // Escalar los datos
    const x = d3
      .scaleBand()
      .domain(meses)
      .range([0, svgWidth])
      .padding(0.3);

    const y = d3.scaleLinear().domain([0, maxValue]).range([svgHeight, 0]);

    // Crear el lienzo SVG
    const svg = d3
      .select('#grafico-barras')
      .append('svg')
      .attr('width', svgWidth + margin.left + margin.right)
      .attr('height', svgHeight + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Añadir el título al contenedor g del SVG
    svg
      .append('text')
      .attr('x', 0) // Posición x del texto (centro del SVG)
      .attr('y', -margin.top / 2) // Posición y del texto (encima del SVG)
      .attr('text-anchor', 'middle') // Anclaje del texto al centro
      .text('INGRESOS / EGRESOS')
      .attr('font-weight', 'bold');

    // Crear las barras de ingresos
    svg.selectAll(".bar-ingresos")
      .data(datosMeses)
      .enter()
      .append("rect")
      .attr("class", "bar-ingresos")
      .attr('x', d => {
        const xPos = x(d.mes);
        return xPos !== undefined ? xPos : 0; // Manejar el caso donde xPos sea undefined
      })
      .attr("y", d => y(d.ingreso))
      .attr("width", x.bandwidth() / 2)
      .attr("height", d => svgHeight - y(d.ingreso))
      .attr("fill", "#748226");

    // Crear las barras de egresos
    svg.selectAll(".bar-egresos")
      .data(datosMeses)
      .enter()
      .append("rect")
      .attr("class", "bar-egresos")
      .attr('x', d => {
        const xPos = x(d.mes);
        return xPos !== undefined ? xPos + x.bandwidth() / 2 : 0; // Manejar el caso donde xPos sea undefined
      })
      .attr("y", d => y(d.gasto))
      .attr("width", x.bandwidth() / 2)
      .attr("height", d => svgHeight - y(d.gasto))
      .attr("fill", "steelblue");

    // Añadir ejes
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    svg.append('g').attr('transform', `translate(0,${svgHeight})`).call(xAxis);

    svg.append('g').call(yAxis);
}


  unificarGastos(gastos:any) {
    if(this.anoSeleccionado != gastos.año){
      return {meessage: 'los gastos no corresponden al año requerido'}
    }else{
      const registros = gastos.registros;
      let gastosUnificados: GastosUnificados = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0}
      registros.forEach((registro: any) => {
        let gastosMes=0;
        let mes : number = registro.mes;
        if (registro.credito && registro.credito.cuota) {
          gastosMes += registro.credito.cuota;
        }
        if (registro.servicios && registro.servicios.administracion) {
          gastosMes += registro.servicios.administracion;
        }
        if (registro.servicios && registro.servicios.agua) {
          gastosMes += registro.servicios.agua;
        }
        if (registro.servicios && registro.servicios.energia) {
          gastosMes += registro.servicios.energia;
        }
        if (registro.servicios && registro.servicios.gas) {
          gastosMes += registro.servicios.gas;
        }
        if (registro.servicios && registro.servicios.internet) {
          gastosMes += registro.servicios.internet;
        }
        gastosUnificados[mes] = gastosMes;
      });
      return gastosUnificados;
    }
  }
}
