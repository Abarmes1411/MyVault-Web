import {Component, OnInit} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../../services/auth.service';
import {Router, RouterLink} from '@angular/router';
import {matchValidator} from '../../../validators/match.validators';
import {UserCredential} from '@angular/fire/auth';
import {UserVault} from '../../../models/UserVault.model';
import {UserService} from '../../../services/user.service';
import {take} from 'rxjs';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {

  registerForm: FormGroup;
  alertMessage: string | null = null;
  alertType: 'success' | 'error' | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      passwordConfirm: ['', [Validators.required]],

    }, { validators: matchValidator('password', 'passwordConfirm') });
  }

  ngOnInit() {
  }


  register() {
    if (this.registerForm.valid) {
      const name = this.registerForm.get("name")?.value;
      const surname = this.registerForm.get("surname")?.value;
      const username = this.registerForm.get("username")?.value;
      const email = this.registerForm.get("email")?.value;
      const password = this.registerForm.get("password")?.value;

      this.authService.register({ email, password })
        .then((userCredential: UserCredential) => {
          const id = userCredential.user.uid;

          const user: UserVault = new UserVault(id, name, surname, username, email);

          this.userService.savePerson(user).then(() => {
            this.router.navigate(["/home"]);
          }).catch(err => {
            console.error("Error al guardar en Firebase Database:", err);
          });

        })
        .catch(error => {
          if (error.code === 'auth/email-already-in-use') {
            this.showAlert("Ese email ya existe", 'error');
          } else {
            console.error('Error al registrar usuario:', error);
          }
        });
    }
  }





  private showAlert(message: string, type: 'success' | 'error'): void {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = null;
      this.alertType = null;
    }, 3000);
  }

}
