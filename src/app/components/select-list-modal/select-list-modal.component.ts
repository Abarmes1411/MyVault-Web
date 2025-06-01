import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-select-list-modal',
  imports: [
    NgForOf
  ],
  templateUrl: './select-list-modal.component.html',
  styleUrl: './select-list-modal.component.css'
})
export class SelectListModalComponent {
  @Input() listNames: string[] = [];
  @Output() listSelected = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  selectList(name: string) {
    this.listSelected.emit(name);
  }

  cancel() {
    this.cancelled.emit();
  }
}
