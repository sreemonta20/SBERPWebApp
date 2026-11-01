import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CommonService, LoaderService, NotificationService, HumanResourcesService,
} from '@app/core/services';
import { PayrollService } from '@app/core/services/payroll.service';
import { User } from '@app/core/class';
import { MessageConstants } from '@app/core/constants';
import { isCommonErrorShow } from '@environments/environment';
import { PagingSearchFilter } from '@app/core/interface/common';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { take } from 'rxjs';

/** Per-employee salary structure: basic + a set of component lines (each fixed
 *  or % of basic). Versioned by effective dates; a new structure closes the
 *  previous open one server-side. */
@Component({
  selector: 'app-salary-structure',
  standalone: false,
  templateUrl: './salary-structure.component.html',
  styleUrls: ['./salary-structure.component.css'],
})
export class SalaryStructureComponent implements OnInit {
  public appUserProfileId = '';
  public isView = false; public isCreate = false; public isUpdate = false; public isDelete = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  public viewMode: 'list' | 'form' = 'list';
  public isEdit = false;

  public totalRows = 0; public currentPage = 1; public pageSize = 10;
  public pageCount = 0; public startPage = 1; public endPage = 0;
  public pageSizeList: number[] = this.commonService.pageSize();

  public list: any[] = [];
  public employees: any[] = [];
  public components: any[] = [];
  public searchTerm = '';

  public form!: FormGroup;
  public deleteConfirmationMessage = '';
  private pendingDeleteId = '';
  public error_message: any;
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private payrollService: PayrollService,
    private hrService: HumanResourcesService,
    private notifyService: NotificationService,
    private loadingService: LoaderService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.commonService.GetLoggedInUser().pipe(take(1)).subscribe((u: User) => (this.appUserProfileId = u?.Id || ''));
    const p = this.commonService.getMenuPermission(this.router.url);
    this.isView = p.IsView; this.isCreate = p.IsCreate; this.isUpdate = p.IsUpdate; this.isDelete = p.IsDelete;
    this.initForm();
    this.loadPaging();
    this.loadEmployees();
    this.loadComponents();
  }

  initForm(): void {
    this.form = this.formBuilder.group({
      id: [null],
      employeeId: ['', Validators.required],
      basicSalary: [0, Validators.required],
      currency: ['AED'],
      effectiveFrom: [null, Validators.required],
      effectiveTo: [null],
      remarks: [''],
      lines: this.formBuilder.array([]),
      createUpdateBy: [this.appUserProfileId],
    });
  }

  get lines(): FormArray { return this.form.get('lines') as FormArray; }

  newLine(componentId = '', calcMethod = 1, value = 0): FormGroup {
    return this.formBuilder.group({
      payComponentId: [componentId, Validators.required],
      calcMethod: [calcMethod],
      value: [value, Validators.required],
    });
  }

  addLine(): void { this.lines.push(this.newLine()); }
  removeLine(i: number): void { this.lines.removeAt(i); }

  // when a component is picked, default the calc method + value from its definition
  onComponentPick(i: number): void {
    const grp = this.lines.at(i);
    const comp = this.components.find((c) => c.id === grp.value.payComponentId);
    if (comp) grp.patchValue({ calcMethod: comp.calcMethod, value: comp.defaultValue ?? 0 });
  }

  loadPaging(): void {
    this.loadingService.setLoading(true);
    const filter: PagingSearchFilter = {
      SearchTerm: this.searchTerm, SortColumnName: '', SortColumnDirection: 'desc',
      PageNumber: this.currentPage, PageSize: this.pageSize,
    } as any;
    this.payrollService.getAllSalaryStructuresPagingWithSearch(filter as any).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success && res.result) {
          this.list = res.result.items || [];
          this.totalRows = res.result.rowCount || 0;
          this.pageCount = res.result.pageCount || 0;
          this.currentPage = res.result.currentPage || this.currentPage;
          this.updatePageIndices();
        } else { this.list = []; this.totalRows = 0; this.pageCount = 0; }
      },
      error: (e) => this.handleError(e),
    });
  }

  loadEmployees(): void {
    this.hrService.getAllEmployees().subscribe({
      next: (r: any) => { if (r?.success && Array.isArray(r.result)) this.employees = r.result; }, error: () => {},
    });
  }
  loadComponents(): void {
    this.payrollService.getPayComponentsLookup().subscribe({
      next: (r: any) => { if (r?.success && Array.isArray(r.result)) this.components = r.result; }, error: () => {},
    });
  }

  openCreateForm(): void {
    if (!this.isCreate) return;
    this.isEdit = false; this.initForm();
    this.addLine();   // start with one empty line
    this.viewMode = 'form';
  }

  edit(row: any): void {
    if (!this.isUpdate) return;
    this.isEdit = true;
    this.loadingService.setLoading(true);
    this.payrollService.getSalaryStructureDetail(row.id).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        const d = res?.result;
        if (!res?.success || !d) { this.notifyService.showWarning('Could not load structure', MessageConstants.GENERAL_WARNING_TITLE); return; }
        this.initForm();
        this.form.patchValue({
          id: d.Id || d.id, employeeId: d.EmployeeId || d.employeeId,
          basicSalary: d.BasicSalary ?? d.basicSalary, currency: d.Currency || d.currency || 'AED',
          effectiveFrom: this.toDateInput(d.EffectiveFrom || d.effectiveFrom),
          effectiveTo: this.toDateInput(d.EffectiveTo || d.effectiveTo),
          remarks: d.Remarks || d.remarks, createUpdateBy: this.appUserProfileId,
        });
        const lines = d.Lines || d.lines || [];
        lines.forEach((l: any) => this.lines.push(this.newLine(l.PayComponentId || l.payComponentId, l.CalcMethod || l.calcMethod, l.Value ?? l.value)));
        if (this.lines.length === 0) this.addLine();
        this.viewMode = 'form';
      },
      error: (e) => this.handleError(e),
    });
  }

  private toDateInput(v: any): string | null {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }

  cancelForm(): void { this.viewMode = 'list'; this.isEdit = false; }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notifyService.showWarning('Please fill the required fields', MessageConstants.GENERAL_WARNING_TITLE);
      return;
    }
    const request = { actionName: this.isEdit ? 'Update' : 'Save', ...this.form.value, createUpdateBy: this.appUserProfileId };
    this.loadingService.setLoading(true);
    this.payrollService.createUpdateSalaryStructure(request).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) { this.notifyService.showSuccess(res.message || 'Saved', MessageConstants.GENERAL_SUCCESS_TITLE); this.viewMode = 'list'; this.loadPaging(); }
        else this.notifyService.showWarning(res?.message || 'Save failed', MessageConstants.GENERAL_WARNING_TITLE);
      },
      error: (e) => this.handleError(e),
    });
  }

  remove(row: any): void {
    if (!this.isDelete || !row?.id) return;
    this.pendingDeleteId = row.id;
    this.deleteConfirmationMessage = `Salary structure ${row.structureCode} will be inactivated. Continue?`;
    this.confirmDialog?.open();
  }

  executeDelete(): void {
    if (!this.pendingDeleteId) return;
    this.loadingService.setLoading(true);
    this.payrollService.deleteSalaryStructure(this.pendingDeleteId).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) { this.notifyService.showSuccess(res.message || 'Removed', MessageConstants.GENERAL_SUCCESS_TITLE); this.loadPaging(); }
        else this.notifyService.showWarning(res?.message || 'Remove failed', MessageConstants.GENERAL_WARNING_TITLE);
        this.pendingDeleteId = '';
      },
      error: (e) => { this.handleError(e); this.pendingDeleteId = ''; },
    });
  }

  componentName(id: string): string { return this.components.find((c) => c.id === id)?.name || ''; }

  changePage(page: number): void { if (page >= 1 && page <= this.pageCount) { this.currentPage = page; this.loadPaging(); } }
  changePageSize(event: any): void { this.pageSize = +event.target.value; this.currentPage = 1; this.loadPaging(); }
  search(): void { this.currentPage = 1; this.loadPaging(); }
  updatePageIndices(): void { this.startPage = (this.currentPage - 1) * this.pageSize + 1; this.endPage = this.startPage - 1 + this.list.length; }

  private handleError(error: any): void {
    this.loadingService.setLoading(false);
    this.error_message = error?.error;
    this.notifyService.showError(isCommonErrorShow ? MessageConstants.INTERNAL_ERROR_MEG : this.error_message, MessageConstants.GENERAL_ERROR_TITLE);
  }
}
