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

  // Devuelve la cantidad de elementos de la lista (usado en la vista)
  getItemsCount(items: any): number {
    return items ? Object.keys(items).length : 0;
  }

  // Carga todas las listas personalizadas desde el servicio
  loadCustomLists() {
    this.customlistService.getAllAustomLists().subscribe((data) => {
      this.customlists = data;
    });
  }

  // Activa el modo de edición y guarda el nombre actual
  activateEdit(): void {
    this.editandoNombre = true;
    this.nuevoNombre = this.customlistInput.listName;
  }

  // Cancela el modo de edición y borra el texto introducido
  cancelEdit(): void {
    this.editandoNombre = false;
  }

  // Guarda el nuevo nombre de la lista si es diferente al actual
  saveName(): void {
    const oldName = this.customlistInput.id;
    const newName = this.nuevoNombre.trim();

    // Si el nuevo nombre está vacío o no ha cambiado, cancela la edición
    if (!newName || newName === oldName) {
      this.cancelEdit();
      return;
    }

    // Llama al servicio para actualizar el nombre de la lista
    this.customlistService.updateListName(oldName, newName)
      .then(() => {
        // Actualiza localmente el nombre de la lista
        this.customlistInput.listName = newName;
        this.customlistInput.id = newName;
        this.cancelEdit();
      })
      .catch((err) => {
        console.error('Error al actualizar el nombre:', err);
        alert('No se pudo actualizar el nombre de la lista.');
      });
  }

  // Elimina una lista personalizada tras la confirmación del usuario
  deleteList(listName: string): void {
    const confirmed = confirm(`¿Estás seguro de que deseas eliminar la lista "${listName}"?`);
    if (!confirmed) return;

    this.customlistService.deleteCustomList(listName)
      .then(() => {
        // Recarga las listas tras eliminar una
        this.loadCustomLists();
      })
      .catch((error) => {
        console.error(`Error al eliminar la lista "${listName}":`, error);
        alert('Ocurrió un error al eliminar la lista.');
      });
  }
}
