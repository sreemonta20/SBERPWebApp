import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Subscription, filter } from 'rxjs';
import { DEFAULT_AVATAR_URL, PhotoOwner, PhotoService } from '@app/core/services/photo.service';

/**
 * Round photo of a user profile or an employee (default avatar when there is none).
 * Standalone, so any feature module can import it:
 *   <app-photo-thumb owner="employee" [ownerId]="e.id" [photoId]="e.photoId" [size]="32"></app-photo-thumb>
 */
@Component({
  selector: 'app-photo-thumb',
  standalone: true,
  template: `<img [src]="src" [style.width.px]="size" [style.height.px]="size" [alt]="alt"
                  class="img-circle elevation-1 photo-thumb" />`,
  styles: [`.photo-thumb { object-fit: cover; background: #d2d6de; }`],
})
export class PhotoThumbComponent implements OnInit, OnChanges, OnDestroy {
  @Input() owner: PhotoOwner = 'user';
  @Input() ownerId: string | null | undefined;
  /** null = no photo (no request); undefined = unknown. */
  @Input() photoId: string | null | undefined;
  @Input() size = 32;
  @Input() alt = 'Photo';

  src = DEFAULT_AVATAR_URL;
  private load?: Subscription;
  private changes?: Subscription;

  constructor(private photoService: PhotoService) {}

  ngOnInit(): void {
    this.changes = this.photoService.photoChanged$
      .pipe(filter((c) => c.owner === this.owner && c.id === this.ownerId))
      .subscribe(() => this.reload(undefined));
  }

  ngOnChanges(): void {
    this.reload(this.photoId);
  }

  private reload(photoId: string | null | undefined): void {
    this.load?.unsubscribe();
    this.load = this.photoService
      .photoUrl(this.owner, this.ownerId, photoId)
      .subscribe((url) => (this.src = url));
  }

  ngOnDestroy(): void {
    this.load?.unsubscribe();
    this.changes?.unsubscribe();
  }
}
