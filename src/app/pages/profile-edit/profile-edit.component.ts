import {Component, OnInit} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {UserVault} from '../../models/UserVault.model';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  standalone: true,
  styleUrls: ['./profile-edit.component.css'],
  imports: [CommonModule, FormsModule, RouterLink]
})
export class ProfileEditComponent implements OnInit {
  userVault: UserVault | null = null;
  successMessage: string | null = null;


  profileOptions: string[] = [
    'movie_profile_pic.png',
    'show_profile_pic.png',
    'game_profile_pic.png',
    'manganovel_profile_pic.png'
  ];

  mostrarSelector: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}



  ngOnInit(): void {
    this.authService.getUserVault().subscribe(user => {
      if (user) {
        this.userVault = new UserVault(
          user.id,
          user.name,
          user.surname,
          user.username,
          user.email,
          user.profilePic,
          user.customLists,
          user.friends,
          user.userReviews,
          user.myVault
        );
      }
    });
  }


  seleccionarFoto(foto: string): void {
    if (this.userVault) {
      this.userVault.profilePic = foto;
      this.mostrarSelector = false;
    }
  }


  guardarCambios(): void {
    if (this.userVault) {
      this.authService.updateUserVault(this.userVault).then(() => {
        this.successMessage = '¡Cambios guardados correctamente!';
        setTimeout(() => {
          this.successMessage = null;
          this.router.navigate(['/profile']);
        }, 2000);
      }).catch(err => {
        console.error('Error al actualizar', err);
      });
    }
  }

}

