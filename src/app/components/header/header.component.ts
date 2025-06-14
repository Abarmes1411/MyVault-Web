import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Router, RouterLink} from '@angular/router';
import {UserService} from '../../services/user.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [
    NgIf, RouterLink
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  showSearch = false;

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(private authService: AuthService, private router: Router, private userService: UserService) {}

  isLoggedIn: boolean = false;

  ngOnInit(): void {
    this.authService.getUserDataAuth().subscribe(({ user, userVault }) => {
      this.isLoggedIn = !!user;
    });
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    }).catch(error => { console.log(error); });
  }


}
