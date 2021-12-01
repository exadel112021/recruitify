import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
import { FeedbackSelectRole as FeedbackSelects } from 'src/app/shared/models/AddFeedbackSelectRoles';
import { UserRole } from 'src/app/shared/models/UserRole';
import { UserService } from 'src/app/shared/services/user.service';
import { CandidatesPageFacade } from '../../candidates-page/candidates-page.facade';

@Component({
  selector: 'app-add-feedback-modal',
  templateUrl: './add-feedback-modal.component.html',
  styleUrls: ['./add-feedback-modal.component.scss'],
})
export class AddFeedbackModalComponent implements OnInit, OnDestroy {
  @Input() visible: boolean = false;
  @Output() toggleModal = new EventEmitter<boolean>();
  @Input() editing: boolean = false;

  candidateId: string = '';
  projectId: string = '';
  form: FormGroup;
  feedbackSelects: FeedbackSelects[] = [];
  subscriptions: Subscription[] = [];
  isFeedbackSubmitting = false;

  constructor(
    private candidatesFacade: CandidatesPageFacade,
    private userService: UserService,
    private route: ActivatedRoute,
    private message: NzMessageService
  ) {
    this.form = new FormGroup({
      rating: new FormControl(null, Validators.required),
      textFeedback: new FormControl('', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500),
      ]),
      feedbackType: new FormControl('', Validators.required),
    });
  }

  onClose() {
    this.toggleModal.emit(false);
  }

  onSubmit() {
    for (const i in this.form.controls) {
      if (this.form.controls.hasOwnProperty(i)) {
        this.form.controls[i].markAsDirty();
        this.form.controls[i].updateValueAndValidity();
      }
    }

    if (this.form.valid) {
      this.isFeedbackSubmitting = true;
      this.candidatesFacade
        .createFeedback$({
          ...this.form.value,
          candidateId: this.candidateId,
          projectId: this.projectId,
        })
        .subscribe(
          (data) => {
            this.message.success('Feedback successfully added ');
            this.isFeedbackSubmitting = false;
            this.toggleModal.emit(false);
            console.log(data);
          },
          () => {
            this.message.error('Something went wrong');
            this.isFeedbackSubmitting = false;
          }
        );
    }

    // this.onClose()
  }
  ngOnInit(): void {
    this.subscriptions.push(
      this.route.params.subscribe((params) => {
        this.candidateId = params.id;
        this.projectId = params.projectId;

        const currentProjectRoles = this.userService.getProjectRoles(
          params.projectId
        );

        currentProjectRoles?.forEach((role) => {
          if (role === UserRole.interviewer) {
            this.feedbackSelects.push(
              { feedbackName: 'Tech. interview one', feedbackType: 2 },
              { feedbackName: 'Tech. interview two', feedbackType: 3 }
            );
          }
          if (role === UserRole.mentor) {
            this.feedbackSelects.push({
              feedbackName: 'Mentor feedback',
              feedbackType: 4,
            });
          }
          if (role === UserRole.recruiter) {
            this.feedbackSelects.push({
              feedbackName: 'Recruiter feedback',
              feedbackType: 2,
            });
          }
        });

        this.form.controls.feedbackType.setValue(
          this.feedbackSelects[0].feedbackType
        );
      })
    );
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
