import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../../services/auth.service';
import {Router} from '@angular/router';
import {matchValidator} from '../../../validators/match.validators';
import {UserCredential} from '@angular/fire/auth';
import {User} from '../../../models/UserVault.model';
import {UserService} from '../../../services/user.service';

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

      // Verificar si el email ya está en uso antes de registrar
      this.userService.getAllUsers().subscribe((users) => {
        const emailExists = users.some(user => user.email === email);

        if (emailExists) {
          this.showAlert("Ese email ya existe", 'error');
        } else {
          // Si el correo no existe, proceder con el registro
          this.authService.register({ email, password })
            .then((userCredential: UserCredential) => {
              const id = userCredential.user.uid;
              const createAt = new Date().toLocaleDateString();

              let user: User = new User(
                id,
                name,
                surname,
                username,
                email
              );

              user = JSON.parse(JSON.stringify(user));

              this.userService.savePerson(user).then(() => {
                this.router.navigate(["/home"]);
              });
            })
            .catch(error => {
              console.error('Error al registrar usuario:', error);
            });
        }
      }, error => {
        console.error('Error al obtener la lista de personas:', error);
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
