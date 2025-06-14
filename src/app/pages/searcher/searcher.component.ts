import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { NgForOf, NgIf} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {debounceTime, Subject} from 'rxjs';
import {SearchService} from '../../services/search.service';
import {Categories} from '../../models/Category.model';
import {Content} from '../../models/Content.model';

@Component({
  selector: 'app-searcher',
  imports: [
    FormsModule,
    NgIf,
    NgForOf
  ],
  templateUrl: './searcher.component.html',
  styleUrl: './searcher.component.css'
})
export class SearcherComponent {
  searchText: string = '';
  selectedCategory: Categories = Categories.PELICULAS;
  loading: boolean = false;
  searchResults: any[] = [];
  hasSearched: boolean = false;



  private searchSubject = new Subject<string>();

  constructor(private searchService: SearchService, private router: Router) {
    this.searchSubject.pipe(debounceTime(500)).subscribe(value => {
      this.doASearch(value);
    });
  }

  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }

  doASearch(query: string) {
    this.hasSearched = true;
    if (!query.trim()) {
      this.searchResults = [];
      return;
    }

    this.loading = true;
    this.searchService.searchMinimal(query, this.selectedCategory).subscribe(results => {
      this.searchResults = results;
      this.loading = false;
    }, error => {
      console.error('Error al buscar:', error);
      this.loading = false;
    });
  }

  async verDetalles(item: Content) {
    try {
      this.loading = true;

      const detallesCompletos = await this.searchService.fetchDetails(item);

      const contentKeyID = await this.searchService.insertContent(detallesCompletos);

      // 3. Navegar al detalle con el ID correcto
      if (contentKeyID) {
        this.router.navigate(['/detail-content', contentKeyID]);
      } else {
        console.warn('No se pudo generar el ID del contenido');
      }

    } catch (error) {
      console.error('Error al obtener o guardar detalles:', error);
    } finally {
      this.loading = false;
    }
  }


}
