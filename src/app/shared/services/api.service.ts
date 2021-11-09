import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export const GET = 'Get';
export const POST = 'Post';
export const CREATE = 'Create';
export const DELETE = 'Delete';
export const UPDATE = 'Update';

export const ODATA = '/odata';
export const API = '/api';
export const MOCK = '/assets';

interface queryParams {
  endpoint?: string
  id?: string;
  odata?: OData;
  body?: any;
  mock?: string;
}

interface OData {
  top?: number;
  skip?: number;
  count?: boolean;
  orderby?: any; // || OrderBy
  filter?: Filter[] | Rule[];
}
interface OrderBy {
  names: string[];
  order?: 'asc' | 'desc' | '';
}

interface Rule {
  operator: string;
  filter: Filter[] | Rule[];
}

interface Filter {
  property: string;
  operator: string;
  value: string;
}

export abstract class ApiService {
  private readonly serviceName: string;
  private readonly apiPath: string;

  protected constructor(
    private http: HttpClient,
    apiPath: string,
    serviceName: string = ApiService.name
  ) {
    this.apiPath = apiPath;
    this.serviceName = serviceName;
  }

  get<T>(params: queryParams): Observable<T> {
    return this.wrapRequest<T>(
      this.http.get<T>(this.getApiUrl(params) + this.getQueryOptions(params)),
      GET
    );
  }

  createData<T, B>(params: queryParams, body: B): Observable<T> {
    return this.wrapRequest<T>(
      this.http.post<T>(
        this.getApiUrl(params) + this.getQueryOptions(params),
        body
      ),
      CREATE
    );
  }

  updateData<T, B>(params: queryParams, body: B): Observable<T> {
    return this.wrapRequest<T>(
      this.http.put<T>(
        this.getApiUrl(params) + this.getQueryOptions(params),
        body
      ),
      UPDATE
    );
  }

  deleteData<T>(params: queryParams): Observable<T> {
    return this.wrapRequest<T>(
      this.http.delete<T>(
        this.getApiUrl(params) + this.getQueryOptions(params)
      ),
      DELETE
    );
  }

  protected getApiUrl(params: queryParams): string {
    if (params.mock) {
      return environment.apiUrl + MOCK;
    } else if (params.odata) {
      return environment.apiUrl + ODATA + this.apiPath;
    } else {
      return environment.apiUrl + API + this.apiPath.toLowerCase();
    }
  }

  private getQueryOptions(params: queryParams): string {
    let url = '';
    if (params.mock) {
      url += params.mock;
    } else if (params.odata) {
      url = '?$count=true';
      // url += this.buildOData('top', params.odata.top)
      // url += this.buildOData('skip', params.odata.skip);
      url += this.buildOData('orderby', params.odata.orderby); //+ params.odata.orderby.names.join(',') + ' ' + params.odata.orderby.order
      // url += this.buildOData('filter', params.odata.filter);
    } else {
      url += params.id || params.endpoint
    }
    return url;
  }

  private buildOData(query: string, value: any) {
    return (query && `&$${query}=${value}`) || '';
  }

  private wrapRequest<T>(
    observable: Observable<T>,
    info: string = 'ApiService logger'
  ): Observable<T> {
    return observable.pipe(
      tap(
        (result) => {
          this.log(result, info);
        },
        (error) => {
          this.log(error, info);
        }
      )
    );
  }

  private log(message: any, method: string) {
    if (!environment.production) {
      console.group(method + ' [' + this.serviceName + ']:');
      console.info(message);
      console.groupEnd();
    }
  }
}
