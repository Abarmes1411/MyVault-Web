import {Component, Input, OnInit} from '@angular/core';
import {CustomlistsService} from '../../services/customlists.service';

@Component({
  selector: 'app-customlist-resume',
  imports: [],
  templateUrl: './customlist-resume.component.html',
  styleUrl: './customlist-resume.component.css'
})
export class CustomlistResumeComponent implements OnInit {
  @Input() customlistInput!: any;

  getItemsCount(items: any): number {
    // items puede ser undefined o null, así que controlamos eso
    if (!items) return 0;
    return Object.keys(items).length;
  }

  ngOnInit(): void {
  }
}

