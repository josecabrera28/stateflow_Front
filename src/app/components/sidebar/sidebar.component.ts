import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  constructor(private router: Router ){
  }

  isActive(url: string): boolean {
    return this.router.isActive(url, true);
  }

  logout(){
    try {
      sessionStorage.clear();
      this.router.navigate(['/login']);
    } catch (error) {
      console.log(error);
    }
  }
}
