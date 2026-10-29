import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { gatewayUrl } from '@environments/environment';
import { APIConstants } from '@app/core/constants';

/** Whose photo: a user profile (SecurityDB) or an employee (HumanResourcesDB). */
export type PhotoOwner = 'user' | 'employee';

/** Shown wherever there is no uploaded photo. */
export const DEFAULT_AVATAR_URL = 'assets/img/avatar-default.svg';
/** Same limit as PhotoStorage:MaxFileSizeKB on the server (the server is the one that enforces it). */
export const PHOTO_MAX_SIZE_KB = 2048;
export const PHOTO_ACCEPT = 'image/jpeg,image/png';

export interface PhotoChange {
  owner: PhotoOwner;
  id: string;
}

/** Upload / remove result, the same shape for both services (Security answers PascalCase, HR camelCase). */
export interface PhotoResult {
  success: boolean;
  message: string;
  photoId?: string | null;
}

const PHOTO_URLS: Record<PhotoOwner, { upload: string; get: string; remove: string }> = {
  user: {
    upload: APIConstants.API_UPLOAD_USER_PROFILE_PHOTO_URL,
    get: APIConstants.API_GET_USER_PROFILE_PHOTO_URL,
    remove: APIConstants.API_REMOVE_USER_PROFILE_PHOTO_URL,
  },
  employee: {
    upload: APIConstants.API_UPLOAD_EMPLOYEE_PHOTO_URL,
    get: APIConstants.API_GET_EMPLOYEE_PHOTO_URL,
    remove: APIConstants.API_REMOVE_EMPLOYEE_PHOTO_URL,
  },
};

/**
 * Loads, uploads and removes user profile / employee photos.
 *
 * Photos are personal data, so they are served only to signed-in users: an <img src> cannot send the
 * bearer token, so each photo is downloaded through HttpClient (the auth interceptor adds the token)
 * and shown from a blob: URL. Downloads are cached per photo id; a new upload gets a new photo id,
 * so stale images are never shown.
 */
@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  private readonly cache = new Map<string, Observable<string>>();
  private readonly objectUrls = new Map<string, string>();
  private readonly changed = new Subject<PhotoChange>();

  /** Fires after a photo was uploaded or removed, so every place showing it reloads. */
  public readonly photoChanged$ = this.changed.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * URL to show for a photo: a blob: URL of the uploaded photo, or the default avatar.
   * photoId: null = known to have no photo (no request is made); undefined = unknown (asks the server).
   */
  photoUrl(owner: PhotoOwner, id: string | null | undefined, photoId?: string | null): Observable<string> {
    if (!id || photoId === null) {
      return of(DEFAULT_AVATAR_URL);
    }
    const key = `${owner}:${id}:${photoId ?? '?'}`;
    let photo$ = this.cache.get(key);
    if (!photo$) {
      const params = new HttpParams().set('id', id);
      photo$ = this.http
        .get(`${gatewayUrl}${PHOTO_URLS[owner].get}`, { params, responseType: 'blob', observe: 'response' })
        .pipe(
          map((response: HttpResponse<Blob>) => {
            if (response.status === 204 || !response.body || response.body.size === 0) {
              return DEFAULT_AVATAR_URL;
            }
            const url = URL.createObjectURL(response.body);
            this.objectUrls.set(key, url);
            return url;
          }),
          catchError(() => {
            this.cache.delete(key); // try again next time
            return of(DEFAULT_AVATAR_URL);
          }),
          shareReplay(1),
        );
      this.cache.set(key, photo$);
    }
    return photo$;
  }

  /** Client-side check for a quick message; the server validates again (size and real JPG/PNG content). */
  validate(file: File | null | undefined): string | null {
    if (!file) {
      return 'Please choose a photo.';
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      return 'Only JPG and PNG images are allowed.';
    }
    if (file.size > PHOTO_MAX_SIZE_KB * 1024) {
      return `The photo is larger than ${PHOTO_MAX_SIZE_KB / 1024} MB.`;
    }
    return null;
  }

  upload(owner: PhotoOwner, id: string, file: File, createUpdateBy?: string): Observable<PhotoResult> {
    const form = new FormData();
    form.append('Id', id);
    form.append('File', file, file.name);
    if (createUpdateBy) {
      form.append('CreateUpdateBy', createUpdateBy);
    }
    return this.http.post<any>(`${gatewayUrl}${PHOTO_URLS[owner].upload}`, form).pipe(
      map((response) => this.toResult(response)),
      tap((result) => result.success && this.notifyChanged(owner, id)),
    );
  }

  remove(owner: PhotoOwner, id: string, updatedBy?: string): Observable<PhotoResult> {
    let params = new HttpParams().set('id', id);
    if (updatedBy) {
      params = params.set('updatedBy', updatedBy);
    }
    return this.http.delete<any>(`${gatewayUrl}${PHOTO_URLS[owner].remove}`, { params }).pipe(
      map((response) => this.toResult(response)),
      tap((result) => result.success && this.notifyChanged(owner, id)),
    );
  }

  /** Drop the cached photos of one owner and tell the views showing it. */
  notifyChanged(owner: PhotoOwner, id: string): void {
    const prefix = `${owner}:${id}:`;
    for (const key of Array.from(this.cache.keys())) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        const url = this.objectUrls.get(key);
        if (url) {
          URL.revokeObjectURL(url);
          this.objectUrls.delete(key);
        }
      }
    }
    this.changed.next({ owner, id });
  }

  private toResult(response: any): PhotoResult {
    const result = response?.Result ?? response?.result;
    return {
      success: !!(response?.Success ?? response?.success),
      message: response?.Message ?? response?.message ?? '',
      photoId: result?.ProfilePhotoId ?? result?.photoId ?? null,
    };
  }
}
