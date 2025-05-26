import {Component, OnInit} from '@angular/core';
import {CustomlistResumeComponent} from '../../components/customlist-resume/customlist-resume.component';
import {CustomlistsService} from '../../services/customlists.service';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-customlist',
  imports: [
    CustomlistResumeComponent,
    NgForOf,
    NgIf,
    FormsModule
  ],
  templateUrl: './customlist.component.html',
  styleUrl: './customlist.component.css'
})
export class CustomlistComponent implements OnInit {

  customlists: any[] = [];

  showNewListForm = false;
  newListName = '';
  errorMessage = '';

  constructor(private customlistService: CustomlistsService) {}

  ngOnInit(): void {
    this.loadCustomLists();
  }

  loadCustomLists() {
    this.customlistService.getAllAustomLists().subscribe((data) => {
      this.customlists = data;
    });
  }

  toggleNewListForm() {
    this.showNewListForm = !this.showNewListForm;
    this.errorMessage = '';
    this.newListName = '';
  }

  addNewList() {
    const listName = this.newListName.trim();

    if (!listName) {
      this.errorMessage = 'El nombre de la lista no puede estar vacío.';
      return;
    }

    const exists = this.customlists.some(list => list.listName.toLowerCase() === listName.toLowerCase());

    if (exists) {
      this.errorMessage = 'Ya tienes una lista con ese nombre.';
      return;
    }

    this.customlistService.addCustomList(listName)
      .then(() => {
        this.loadCustomLists();
        this.toggleNewListForm();
      })
      .catch(() => {
        this.errorMessage = 'Error al crear la lista. Inténtalo de nuevo.';
      });
  }




}
