import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
    providedIn: 'root'
})
export class LoaderService {

    private loading: boolean = false;

    constructor(private spinnerService: NgxSpinnerService) { }

    setLoading(loading: boolean) {
        this.loading = loading;
        if (this.loading) {
            this.spinnerService.show();
        } else {
            setTimeout(() => {
                this.spinnerService.hide();
            }, 1000); 

        }
    }

    getLoading(): boolean {
        return this.loading;
    }

    public showSpinner(): void {
        this.spinnerService.show();
    }

    public hideSpinner(time: number): void {
        setTimeout(() => {
            this.spinnerService.hide();
        }, time);
    }

}