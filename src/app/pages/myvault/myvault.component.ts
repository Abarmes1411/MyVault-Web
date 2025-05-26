import { Component } from '@angular/core';
import {DecimalPipe, NgForOf, NgIf} from '@angular/common';
import {Content} from '../../models/Content.model';

@Component({
  selector: 'app-myvault',
  imports: [
    DecimalPipe,
    NgForOf,
    NgIf
  ],
  templateUrl: './myvault.component.html',
  styleUrl: './myvault.component.css'
})
export class MyvaultComponent {
  vaultMovies: Content[] = [];
  vaultShows: Content[] = [];
  vaultGames: Content[] = [];
  vaultAnimes: Content[] = [];
  vaultMangas: Content[] = [];
  vaultNovels: Content[] = [];

}
