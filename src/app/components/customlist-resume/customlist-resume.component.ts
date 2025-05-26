import {Component, Input, OnInit} from '@angular/core';
import {CustomlistsService} from '../../services/customlists.service';
import {RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-customlist-resume',
  imports: [
    RouterLink,
    FormsModule,
    NgIf
  ],
  templateUrl: './customlist-resume.component.html',
  styleUrl: './customlist-resume.component.css'
})
export class CustomlistResumeComponent implements OnInit {
  @Input() customlistInput!: any;
  customlists: any[] = [];

  editandoNombre: boolean = false;
  nuevoNombre: string = '';

  constructor(private customlistService: CustomlistsService) {}

  ngOnInit(): void {}

  getItemsCount(items: any): number {
    return items ? Object.keys(items).length : 0;
  }

  loadCustomLists() {
    this.customlistService.getAllAustomLists().subscribe((data) => {
      this.customlists = data;
    });
  }

  activateEdit(): void {
    this.editandoNombre = true;
    this.nuevoNombre = this.customlistInput.listName;
  }

  cancelEdit(): void {
    this.editandoNombre = false;
  }

  saveName(): void {
    const oldName = this.customlistInput.id;
    const newName = this.nuevoNombre.trim();

    if (!newName || newName === oldName) {
      this.cancelEdit();
      return;
    }

    this.customlistService.updateListName(oldName, newName)
      .then(() => {
        this.customlistInput.listName = newName;
        this.customlistInput.id = newName;
        this.cancelEdit();
      })
      .catch((err) => {
        console.error('Error al actualizar el nombre:', err);
        alert('No se pudo actualizar el nombre de la lista.');
      });
  }

  deleteList(listName: string): void {
    const confirmed = confirm(`¿Estás seguro de que deseas eliminar la lista "${listName}"?`);
    if (!confirmed) return;

    this.customlistService.deleteCustomList(listName)
      .then(() => {
        this.loadCustomLists();
      })
      .catch((error) => {
        console.error(`Error al eliminar la lista "${listName}":`, error);
        alert('Ocurrió un error al eliminar la lista.');
      });
  }


}
