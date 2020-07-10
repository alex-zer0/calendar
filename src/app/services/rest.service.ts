import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { AuthService } from '@auth/core';

@Injectable({ providedIn: 'root' })
export class Rest {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getOrigin<T>(path: string, params?: any): Observable<T> {
    return this.http.get<T>(this.getUrl(path), this.reqOptions(params));
  }

  get<T>(path: string, params?: any): Observable<T> {
    return this.http.get<{data: T}>(this.getUrl(path), this.reqOptions(params))
      .pipe(map(res => res.data));
  }

  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<{data: T}>(this.getUrl(path), body, this.reqOptions())
      .pipe(map(res => res.data));
  }

  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<{data: T}>(this.getUrl(path), body, this.reqOptions())
      .pipe(map(res => res.data));
  }

  patch<T>(path: string, body: any): Observable<T> {
    const patchHeaders = { 'Content-Type': 'application/merge-patch+json' };
    return this.http.patch<{data: T}>(this.getUrl(path), body, this.reqOptions(undefined, patchHeaders))
      .pipe(map(res => res.data));
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<{data: T}>(this.getUrl(path), this.reqOptions())
      .pipe(map(res => res.data));
  }

  private getUrl(path: string) {
    return environment.api + path;
  }

  private reqOptions(params?: HttpParams, addHeaders?: {}): { headers: HttpHeaders, params: HttpParams } {
    let headers = new HttpHeaders({
      observe: 'response',
      responseType: 'json',
      ...addHeaders
    });
    if (environment.needAuth) {
      headers = headers.set('Authorization', this.authService.getAuthorizationHeaderValue());
    }
    return { headers, params };
  }
}
