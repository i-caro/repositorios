// src/app/repositories/impl/base-repository-http.service.ts
import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { IBaseRepository } from '../intefaces/base-repository.interface';
import { API_URL_TOKEN, REPOSITORY_MAPPING_TOKEN, RESOURCE_NAME_TOKEN } from '../repository.tokens';
import { Model } from '../../models/base.model';
import { IBaseMapping } from '../intefaces/base-mapping.interface';
import { Paginated } from '../../models/paginated.model';
import { BaseRepositoryHttpService } from './base-repository-http.service';

export interface PaginatedRaw<T>{
  first:number
  prev:number|null
  next:number|null
  last:number
  pages:number
  items:number
  data:T[]
}
@Injectable({
  providedIn: 'root'
})
export class JsonServerRepositoryService<T extends Model> extends BaseRepositoryHttpService<T> {

  constructor(
    override http: HttpClient,
    @Inject(API_URL_TOKEN) override apiUrl: string, // URL base de la API para el modelo
    @Inject(RESOURCE_NAME_TOKEN) override resource:string, //nombre del recurso del repositorio
    @Inject(REPOSITORY_MAPPING_TOKEN) override mapping:IBaseMapping<T>
  ) {
    super(http, apiUrl, resource, mapping);
    this.apiUrl = apiUrl;
  }

  override getAll(page:number, pageSize:number): Observable<Paginated<T>> {
    return this.http.get<PaginatedRaw<T>>(`${this.apiUrl}/${this.resource}/?_page=${page}&_per_page=${pageSize}`)
      .pipe(map(res=>{
        return this.mapping.getPaginated(page, pageSize, res.pages, res.data);
      }));
  }

  override getById(id: string): Observable<T | null> {
    return this.http.get<T>(`${this.apiUrl}/${this.resource}/${id}`).pipe(map(res=>this.mapping.getOne(res)));
  }

  override add(entity: T): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${this.resource}`, entity).pipe(map(res=>this.mapping.getAdded(res)));
  }

  override update(id: string, entity: T): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${this.resource}/${id}`, entity).pipe(map(res=>this.mapping.getUpdated(res)));
  }

  override delete(id: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${this.resource}/${id}`).pipe(map(res=>this.mapping.getDeleted(res)));
  }
}
