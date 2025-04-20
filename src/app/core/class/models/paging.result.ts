export class PagingResult<T> {
    RowCount: number = 0;
    CurrentPage: number = 0;
    PageSize: number = 0;
    PageCount: number = 0;
    Items?: T[]; // Optional, similar to List<T>? in C#
  
    constructor(init?: Partial<PagingResult<T>>) {
      Object.assign(this, init);
    }
  }