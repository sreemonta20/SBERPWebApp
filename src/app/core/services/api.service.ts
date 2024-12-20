import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, lastValueFrom } from 'rxjs';
import { SessionStorageService } from '../services/session.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService<T> {
  // private baseUrl = 'https://example.com/api';
  private baseUrl: string = '';

  constructor(
    private http: HttpClient,
    private sessionService: SessionStorageService
  ) {}

  initializeBaseURL(inputUrl: string) {
    this.baseUrl = inputUrl;
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  public get(endpoint: string, params: HttpParams): Observable<T> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.get<T>(url, { headers: headers, params: params });
  }

  public getById(endpoint: string, params: HttpParams): Observable<T> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.get<T>(url, { headers: headers, params: params });
  }

  public getAll(endpoint: string, params: HttpParams): Observable<T> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.get<T>(url, { headers: headers, params: params });
  }

  public post(endpoint: string, body: any): Observable<T> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.post<T>(url, body, { headers });
  }

  public async postDataAsync<T>(endpoint: string, body: any): Promise<T> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}${endpoint}`;
    const response = await lastValueFrom(
      this.http.post<T>(url, body, { headers })
    );
    return response;
  }

  public async postAsync(endpoint: string, body: any): Promise<T> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}${endpoint}`;
    const response = await lastValueFrom(
      this.http.post<T>(url, body, { headers })
    );
    return response;
  }

  public put(endpoint: string, body: any, params: HttpParams): Observable<T> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.put<T>(url, body, { headers: headers, params: params });
  }

  public delete(endpoint: string, params: HttpParams): Observable<T> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.delete<T>(url, { headers: headers, params: params });
  }

  public getByIdExtn(id: number, endpoint: string): Observable<T> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}/${endpoint}/${id}`;
    return this.http.get<T>(url, { headers });
  }

  public getAllExtn(endpoint: string): Observable<T> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}/${endpoint}`;
    return this.http.get<T>(url, { headers });
  }

  public postByExtn(endpoint: string, body: T): Observable<T> {
    const headers = this.getHeaders();
    return this.http.post<T>(endpoint, body, { headers });
  }

  public putExtn(id: number, endpoint: string, body: T): Observable<T> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}/${endpoint}/${id}`;
    return this.http.put<T>(url, body, { headers });
  }

  public deleteExtn(id: number, endpoint: string): Observable<any> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}/${endpoint}/${id}`;
    return this.http.delete(url, { headers });
  }

  public postWithParams<T>(endpoint: string, params: any): Observable<T> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}/${endpoint}`;
    return this.http.post<T>(url, params, { headers });
  }

  public postWithParamsAndModel<T>(endpoint: string, params: any, bodyModel: any): Observable<T> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}/${endpoint}`;
    const httpParams = new HttpParams({ fromObject: params });

    return this.http.post<T>(url, bodyModel, { headers, params: httpParams });

  }
}
