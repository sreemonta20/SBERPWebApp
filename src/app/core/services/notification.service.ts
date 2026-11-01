import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private toastr: ToastrService) { }
   
  showSuccess(message: any, title: any){
      this.toastr.success(message, title)
  }
   
  showError(message: any, title: any){
      this.toastr.error(this.toText(message), title)
  }
   
  showInfo(message: any, title: any){
      this.toastr.info(message, title)
  }
   
  showWarning(message: any, title: any){
      this.toastr.warning(message, title)
  }

  /**
   * Screens pass the raw response body when the API refuses a call, e.g. { Success, Message }
   * from Security or { success, message } from HR: an object would show as "[object Object]".
   */
  private toText(message: any): string {
    if (message && typeof message === 'object') {
      return message.Message ?? message.message ?? 'Something went wrong. Please try again.';
    }
    return message;
  }
   
}