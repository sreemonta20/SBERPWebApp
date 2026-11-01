import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  CommonService, LoaderService, NotificationService,
} from '@app/core/services';
import { RecruitmentService } from '@app/core/services/recruitment.service';
import { User } from '@app/core/class';
import { MessageConstants } from '@app/core/constants';
import { isCommonErrorShow } from '@environments/environment';
import { PagingSearchFilter } from '@app/core/interface/common';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { take } from 'rxjs';

/**
 * Applicant pipeline. Pick a published posting, then see its applications laid
 * out in stage columns (Applied → Screening → Shortlisted → Interview → Offer →
 * Hired). Each card can be advanced or rejected; the move goes through
 * SP_MoveApplicationStage on the backend. Same permission + viewMode discipline
 * as the other HR screens.
 */
@Component({
  selector: 'app-applicant-pipeline',
  standalone: false,
  templateUrl: './applicant-pipeline.component.html',
  styleUrls: ['./applicant-pipeline.component.css'],
})
export class ApplicantPipelineComponent implements OnInit {
  public appUserProfileId = '';
  public isView = false;
  public isUpdate = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  public postings: any[] = [];
  public selectedPostingId = '';
  public applications: any[] = [];

  public readonly stages = [
    { id: 1, name: 'Applied' },
    { id: 2, name: 'Screening' },
    { id: 3, name: 'Shortlisted' },
    { id: 4, name: 'Interviewing' },
    { id: 5, name: 'Offer' },
    { id: 6, name: 'Hired' },
  ];
  public readonly REJECTED = 7;

  public error_message: any;
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;
  private pendingReject: any = null;
  public deleteConfirmationMessage = '';

  constructor(
    public router: Router,
    private recruitmentService: RecruitmentService,
    private notifyService: NotificationService,
    private loadingService: LoaderService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.commonService.GetLoggedInUser().pipe(take(1)).subscribe((u: User) => (this.appUserProfileId = u?.Id || ''));
    const p = this.commonService.getMenuPermission(this.router.url);
    this.isView = p.IsView; this.isUpdate = p.IsUpdate;
    this.loadPostings();
  }

  loadPostings(): void {
    const filter: PagingSearchFilter = {
      SearchTerm: '', SortColumnName: '', SortColumnDirection: 'desc', PageNumber: 1, PageSize: 100,
    } as any;
    this.recruitmentService.getAllJobPostingsPagingWithSearch(filter as any).subscribe({
      next: (res: any) => {
        if (res?.success && res.result) this.postings = res.result.items || [];
      },
      error: (e) => this.handleError(e),
    });
  }

  onPostingChange(): void {
    if (!this.selectedPostingId) { this.applications = []; return; }
    this.loadingService.setLoading(true);
    this.recruitmentService.getApplicationsByPosting(this.selectedPostingId).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        this.applications = (res?.success && Array.isArray(res.result)) ? res.result : [];
      },
      error: (e) => this.handleError(e),
    });
  }

  cardsFor(stageId: number): any[] {
    return this.applications.filter((a) => a.stageId === stageId);
  }

  countFor(stageId: number): number {
    return this.cardsFor(stageId).length;
  }

  advance(card: any): void {
    if (!this.isUpdate) return;
    const nextStage = Math.min(card.stageId + 1, 6);
    this.move(card, nextStage);
  }

  reject(card: any): void {
    if (!this.isUpdate) return;
    this.pendingReject = card;
    this.deleteConfirmationMessage = `Reject ${card.candidateName}'s application?`;
    this.confirmDialog?.open();
  }

  executeReject(): void {
    if (!this.pendingReject) return;
    this.move(this.pendingReject, this.REJECTED, 'Rejected after review');
    this.pendingReject = null;
  }

  private move(card: any, stageId: number, rejectionReason?: string): void {
    this.loadingService.setLoading(true);
    this.recruitmentService.moveApplicationStage({
      id: card.id,
      stageId,
      rejectionReason,
      createUpdateBy: this.appUserProfileId,
    }).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) {
          this.notifyService.showSuccess(res.message, MessageConstants.GENERAL_SUCCESS_TITLE);
          this.onPostingChange();
        } else {
          this.notifyService.showWarning(res?.message || 'Move failed', MessageConstants.GENERAL_WARNING_TITLE);
        }
      },
      error: (e) => this.handleError(e),
    });
  }

  private handleError(error: any): void {
    this.loadingService.setLoading(false);
    this.error_message = error?.error;
    this.notifyService.showError(
      isCommonErrorShow ? MessageConstants.INTERNAL_ERROR_MEG : this.error_message,
      MessageConstants.GENERAL_ERROR_TITLE,
    );
  }
}
