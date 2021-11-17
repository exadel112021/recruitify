import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { DragulaService } from 'ng2-dragula';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-table-for-staff',
  templateUrl: './table-for-staff.component.html',
  styleUrls: ['./table-for-staff.component.scss'],
})
export class TableForStaffComponent implements OnInit {
  interviewersTimeTable: any = [];
  today = new Date().toLocaleDateString();
  subs = new Subscription();

  constructor(
    private dragulaService: DragulaService,
    private http: HttpClient
  ) {
    dragulaService.createGroup('calendar', {
      revertOnSpill: true,
    });
    this.subs.add(
      dragulaService.drag('calendar').subscribe(({ el }) => {
        console.log(el);
      })
    );
    this.subs.add(
      dragulaService.over('calendar').subscribe(({ container }) => {
        container.classList.add('over');
      })
    );
    this.subs.add(
      dragulaService.out('calendar').subscribe(({ container }) => {
        container.classList.remove('over');
      })
    );
    this.subs.add(
      dragulaService.drop('calendar').subscribe(({ el, target }) => {
        if (target.classList.contains('avaliable')) {
          el.innerHTML = '';
          el.className = 'd-none';
          // console.log('drop', el);
          // console.log('drop', target);
          // console.log('drop', sibling);
          // target.className = 'assigned';
          target.classList.add('assigned');
        }
      })
    );
  }

  ngOnInit(): void {
    this.http
      .get('/assets/interviewer-calendar.json')
      .subscribe((response) => (this.interviewersTimeTable = response));
  }
}
