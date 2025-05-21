import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  constructor(private authService:AuthService, private router:Router, private userService:UserService){}

  isLoggedIn: boolean = false;
  role:string|null=null;

  ngOnInit(): void {

    this.authService.getUserDataAuth().subscribe(({user,userVault})=>{
      if(user){
        this.isLoggedIn = true;
      }else{
        this.isLoggedIn = false;
      }
    })
  }

  logout(){
    this.authService.logout().then(()=>{
      this.router.navigate(["/"]);
    }).catch((error)=>{console.log(error)});
  }

}
