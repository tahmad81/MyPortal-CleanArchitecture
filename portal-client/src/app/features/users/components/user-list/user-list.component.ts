import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';

import { UserListFacade } from './store/user-list.facade';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  private readonly userListFacade = inject(UserListFacade);

  readonly users$ = this.userListFacade.users$;
  readonly isLoading$ = this.userListFacade.isLoading$;
  readonly error$ = this.userListFacade.error$;

  ngOnInit(): void {
    this.userListFacade.load();
  }
}

