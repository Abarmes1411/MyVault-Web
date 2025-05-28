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

  starIcons: string[] = [];
  contentData: any = null;
  hovered: boolean = false;
  showEditModal: boolean = false;
  updateDisabled: boolean = false;

  editReviewData: any = null;



  constructor(private userReviewService: UserreviewsService) {
  }


  ngOnInit(): void {
    this.loadContentData();
  }

  ngOnChanges(): void {
    if (this.userReviewInput?.rating !== undefined) {
      this.generateStars(this.userReviewInput.rating);
    }
    this.loadContentData();
  }

  openEditModal(): void {
    // Clonamos para no editar directamente el input (evitar problemas en el binding)
    this.editReviewData = { ...this.userReviewInput };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }


  updateReview(): void {
    const reviewID = this.userReviewInput.id;
    const contentID = this.userReviewInput.contentID;

    if (!reviewID || !contentID) {
      console.error('Faltan datos para actualizar la reseña');
      return;
    }

    this.updateDisabled = true;

    const updatedReview = {
      comment: this.editReviewData.comment,
      rating: this.editReviewData.rating,
      contentID: this.userReviewInput.contentID,
      id: this.userReviewInput.id,
      reviewDate: this.userReviewInput.reviewDate,
    };

    this.userReviewService.updateReview(reviewID, contentID, updatedReview).subscribe({
      next: () => {
        console.log('Review actualizada correctamente');
        this.generateStars(this.editReviewData.rating);
        this.closeEditModal();

        // Limpiar los datos del formulario para la próxima edición
        this.editReviewData = null;

        // Desactivar el botón "Editar review" durante 5 segundos
        setTimeout(() => {
          this.updateDisabled = false;
        }, 5000);
      },
      error: err => {
        console.error('Error al actualizar la review:', err);
        this.updateDisabled = false;
      }
    });
  }




  private generateStars(rating: number): void {
    this.starIcons = [];

    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        this.starIcons.push('assets/stars/full_star.PNG');
      } else if (rating >= i - 0.5) {
        this.starIcons.push('assets/stars/half_star.PNG');
      } else {
        this.starIcons.push('assets/stars/empty_star.png');
      }
    }
  }

  private loadContentData(): void {
    if (!this.userReviewInput?.contentID) return;

    this.userReviewService.getContentByAnyId(this.userReviewInput.contentID)
      .subscribe(content => {
        this.contentData = content;
      });
  }

  deleteReview(): void {

    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar esta review? Esta acción no se puede deshacer.');

    if (!confirmDelete) {
      return;
    }

    const reviewID = this.userReviewInput.id;
    const contentID = this.userReviewInput.contentID;

    if (!reviewID || !contentID) {
      console.error('Faltan datos para eliminar la reseña');
      return;
    }

    this.userReviewService.deleteReview(reviewID, contentID).subscribe({
      next: () => {
        console.log('Review eliminada correctamente');
        this.loadContentData();
      },
      error: (err) => {
        console.error('Error al eliminar la review:', err);
      }
    });
  }


}
