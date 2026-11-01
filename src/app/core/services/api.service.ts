import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService<T> {
  private baseUrl: string = '';

  constructor(private http: HttpClient) {}

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

  public async postAsync(endpoint: string, body: any): Promise<T> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}${endpoint}`;
    const response = await lastValueFrom(
      this.http.post<T>(url, body, { headers }),
    );
    return response;
  }

  public delete(endpoint: string, params: HttpParams): Observable<T> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.delete<T>(url, { headers: headers, params: params });
  }

  public async getAllWithoutParamsAsync(endpoint: string): Promise<T> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}${endpoint}`;
    const response = await lastValueFrom(this.http.get<T>(url, { headers }));
    return response;
  }

  public getAllWithoutParams(endpoint: string): Observable<T> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.get<T>(url, { headers });
  }

  public update(endpoint: string, body: any): Observable<T> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.put<T>(url, body, { headers });
  }

  public postFormData(endpoint: string, formData: FormData): Observable<T> {
    return this.http.post<T>(endpoint, formData);
  }
}
