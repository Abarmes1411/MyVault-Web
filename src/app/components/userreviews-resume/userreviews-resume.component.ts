import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {UserreviewsService} from '../../services/userreviews.service';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-userreviews-resume',
  imports: [
    ReactiveFormsModule,
    NgForOf,
    NgIf,
    FormsModule
  ],
  templateUrl: './userreviews-resume.component.html',
  styleUrl: './userreviews-resume.component.css'
})
export class UserreviewsResumeComponent implements OnInit, OnChanges {
  @Input() userReviewInput!: any;
  @Input() isOwner: boolean = true;

  starIcons: string[] = [];
  contentData: any = null;
  hovered: boolean = false;
  showEditModal: boolean = false;
  updateDisabled: boolean = false;

  editReviewData: any = null;



  constructor(private userReviewService: UserreviewsService) {
  }


  // Se ejecuta al inicializar el componente
  ngOnInit(): void {
    this.loadContentData(); // Carga los datos del contenido relacionado con la reseña
  }

  // Se ejecuta cuando cambian los @Input()
  ngOnChanges(): void {
    // Si hay una puntuación definida, genera las estrellas
    if (this.userReviewInput?.rating !== undefined) {
      this.generateStars(this.userReviewInput.rating);
    }
    // Carga los datos del contenido
    this.loadContentData();
  }

  // Abre el modal de edición copiando los datos actuales de la reseña
  openEditModal(): void {
    this.editReviewData = { ...this.userReviewInput };
    this.showEditModal = true;
  }

  // Cierra el modal de edición
  closeEditModal(): void {
    this.showEditModal = false;
  }

  // Carga los datos del contenido asociado a la reseña desde el servicio
  private loadContentData(): void {
    if (!this.userReviewInput?.contentID) {
      console.warn('contentID no definido');
      return;
    }

    console.log('Cargando contenido con ID:', this.userReviewInput.contentID);

    // Llama al servicio para obtener los datos del contenido por su ID
    this.userReviewService.getContentByAnyId(this.userReviewInput.contentID)
      .subscribe(content => {
        if (content) {
          this.contentData = content;
          console.log('Contenido encontrado:', content);
        } else {
          console.warn('No se encontró contenido para el ID:', this.userReviewInput.contentID);
        }
      });
  }

  // Actualiza la reseña del usuario
  updateReview(): void {
    const reviewID = this.userReviewInput.id;
    const contentID = this.userReviewInput.contentID;

    // Verifica que se tengan los IDs necesarios
    if (!reviewID || !contentID) {
      console.error('Faltan datos para actualizar la reseña');
      return;
    }

    // Desactiva el botón de actualización
    this.updateDisabled = true;

    // Crea un objeto con los datos actualizados de la reseña
    const updatedReview = {
      comment: this.editReviewData.comment,
      rating: this.editReviewData.rating,
      contentID: this.userReviewInput.contentID,
      id: this.userReviewInput.id,
      reviewDate: this.userReviewInput.reviewDate,
    };

    // Llama al servicio para actualizar la reseña
    this.userReviewService.updateReview(reviewID, contentID, updatedReview).subscribe({
      next: () => {
        console.log('Review actualizada correctamente');
        // Regenera las estrellas con la nueva puntuación
        this.generateStars(this.editReviewData.rating);
        this.closeEditModal(); // Cierra el modal
        this.editReviewData = null; // Limpia los datos temporales

        // Reactiva el botón tras 5 segundos
        setTimeout(() => {
          this.updateDisabled = false;
        }, 5000);
      },
      error: err => {
        console.error('Error al actualizar la review:', err);
        this.updateDisabled = false; // Reactiva el botón en caso de error
      }
    });
  }

  // Genera las rutas de las imágenes de estrellas según la puntuación
  private generateStars(rating: number): void {
    this.starIcons = [];

    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        this.starIcons.push('assets/stars/full_star.PNG'); // Estrella llena
      } else if (rating >= i - 0.5) {
        this.starIcons.push('assets/stars/half_star.PNG'); // Media estrella
      } else {
        this.starIcons.push('assets/stars/empty_star.png'); // Estrella vacía
      }
    }
  }

  // Elimina la reseña del usuario
  deleteReview(): void {
    // Muestra una confirmación antes de borrar
    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar esta review? Esta acción no se puede deshacer.');

    if (!confirmDelete) {
      return; // Si el usuario cancela, no hace nada
    }

    const reviewID = this.userReviewInput.id;
    const contentID = this.userReviewInput.contentID;

    // Verifica que existan los IDs necesarios
    if (!reviewID || !contentID) {
      console.error('Faltan datos para eliminar la reseña');
      return;
    }

    // Llama al servicio para eliminar la reseña
    this.userReviewService.deleteReview(reviewID, contentID).subscribe({
      next: () => {
        console.log('Review eliminada correctamente');
        this.loadContentData(); // Recarga los datos del contenido tras eliminar
      },
      error: (err) => {
        console.error('Error al eliminar la review:', err);
      }
    });
  }
}
