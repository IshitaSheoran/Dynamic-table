import { Component } from '@angular/core';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { User, UserColumns } from './user';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from './service/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'dymanic-table';
  displayedColumns: string[] = UserColumns.map((col) => col.key);
  columnsSchema: any = UserColumns;

  // MatTableDataSource serves as a data source for the MatTable component
  dataSource: any = new MatTableDataSource<User>();

  // start with an empty object
  // dynamically add validates fields to it while input changes
  // id is key and corresponding validated fields are its values
  valid: any = {};

  constructor(public dialog: MatDialog, public userService: UserService) { }

  ngOnInit() {
    this.userService.getUsers().subscribe((res: any) => {
      this.dataSource.data = res;
    })
  }

  editRow(user: User) {
    if (user.id === 0) {
      this.userService.addUser(user).subscribe((newUser: User) => {
        user.id = newUser.id;
        user.isEdit = false;
      })
    }
    else {
      this.userService.updateUser(user).subscribe(() => (user.isEdit = false));
    }
  }

  addRow() {
    // newRow with its properties defined
    const newRow: User = {
      id: 0,
      firstName: '',
      lastName: '',
      email: '',
      birthDate: '',
      isEdit: true,
      isSelected: false,
    };

    // newRow is added to the beginning of the array dataSource
    // ... is the spread operator - allows to expand an iterable (eg array/obj)
    // because the user will be added in the beginning of dataSource hence its id = 0
    this.dataSource.data = [newRow, ...this.dataSource.data];
  }

  removeRow(id: number) {
    // new array is created
    // dataSource is fileterd as such that new array consists of obj that dont match with the id
    // u represents an individual element/object in the dataSource array

    this.userService.deleteUser(id).subscribe(() => {
      this.dataSource.data = this.dataSource.data.filter((u: User) => u.id !== id)
    });
  }

  removeSelectedRows() {
    // users is a list of all the checked users 
    const users = this.dataSource.data.filter((u: User) => u.isSelected);

    // opens a dialog box 
    // afterClosed() return an observable
    this.dialog.open(ConfirmDialogComponent).afterClosed().subscribe((confirm: any) => {
      if (confirm) {
        this.userService.deleteSelectedUsers(users).subscribe(() => {
          this.dataSource.data = this.dataSource.data.filter((u: User) => !u.isSelected);
        });
      }
    });
  }

  // checkx if all elements in dataSource have the 'isSelected' property set to true
  isAllSelected() {
    // returns true if all elements are in dataSource are selected
    return this.dataSource.data.every((item: any) => item.isSelected);
  }

  // if at least one element in dataSource has its isSelected property set to true
  isAnySelected() {
    return this.dataSource.data.some((item: any) => item.isSelected);
  }

  // update the isSelected property of all elements in the dataSource array
  // updates the isSelected property of each item to match the state of select all action
  // if event.checked is true, all items are set to isSelected: true and vice-verca
  selectAll(event: any) {
    this.dataSource.data = this.dataSource.data.map((item: any) => ({
      ...item,
      isSelected: event.checked,
    }));
  }
  
  // e-> event object
  inputHandler(e: any, id: number, key: string) {
    // checks if there is no object associated with the id property in the valid object
    if (!this.valid[id]) { 
      // if not it initializes an empty object for each unique id
      this.valid[id] = {};
    }
    // checks various validity constrainsts
    // if they all are valid then it assign as key value pair to valid{}
    this.valid[id][key] = e.target.validity.valid;
  }

  // disable submit button if any input field is false
  disableSubmit(id: number) {
    if (this.valid[id]) {
      // checks if any of the values are false inside the object corresponding to the id
      return Object.values(this.valid[id]).some((item) => item === false);
    }
    return false;
  }
}