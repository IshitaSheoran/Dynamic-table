import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../user';
import { Observable, forkJoin, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  private serviceUrl = 'https://dummyjson.com/users'

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    // takes the response data and extracts the users property from it
    return this.http.get(this.serviceUrl).pipe<User[]>(map((data: any) => data.users));
  }

  // http patch request is for updating
  updateUser(user: User): Observable<User> {
    // user is the updated user information 
    return this.http.patch<User>(`${this.serviceUrl}/${user.id}`, user);
  }

  addUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.serviceUrl}/add`, user);
  }

  deleteUser(id: number): Observable<User> {
    return this.http.delete<User>(`${this.serviceUrl}/${id}`);
  }

  deleteSelectedUsers(users: User[]): Observable<User[]> {
    // fork is used to combine multiple observables into one onservable
    // here it combines the results of multiple http delete requests into a single observable
    return forkJoin(users.map((user) => 
      this.http.delete<User>(`${this.serviceUrl}/${user.id}`)
    ));
  }
}
