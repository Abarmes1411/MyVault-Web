import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {UserVault} from '../../models/UserVault.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  standalone: true,
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule, RouterLink]
})
export class ProfileComponent implements OnInit {
  userVault: UserVault | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getUserVault().subscribe(user => {
      this.userVault = user;
    });
  }
}

