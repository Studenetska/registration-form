import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import {
  AbstractControl,
  AsyncValidatorFn,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { catchError, map, Observable, of } from 'rxjs';
import { EmailsInterface } from '../emails-intrface';

import { FormDataService } from '../form-data.service';

@Component({
  selector: 'user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css'],
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  emails!: EmailsInterface[];
  userEmail = { email: '' };

  constructor(
    private fb: FormBuilder,
    private service: FormDataService,
    private http: HttpClient
  ) {}

  formLabels: any = {
    firstName: 'First Name',
    lastName: 'Last Name',
    dateOfBirth: 'Date of Birth',
    frameworks: 'Choose a Framework',
    frameworksVersion: '',
    hobby: 'Choose a Hobby',
    email: 'Email',
  };

  formError: any = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    frameworks: '',
    frameworksVersion: '',
    hobby: '',
    email: '',
  };

  validationErrorMessage: any = {
    firstName: {
      required: 'First name is required',
      minlength: 'First name must be at least 2 characters long',
    },
    lastName: {
      required: 'Last name is required',
      minlength: 'Last name must be at least 2 characters long',
    },
    dateOfBirth: {
      required: 'Date of birth is required',
    },
    frameworks: {
      required: 'Choose a framework',
    },
    frameworksVersion: {
      required: 'Choose a version',
    },
    hobby: {
      required: 'Hobby is required',
    },
    email: {
      required: 'Email is required',
      pattern: 'Invalid email format',
      notAllowedEmail: 'Email already exists. Please try another email',
    },
  };

  frameworksArray: Array<string> = ['angular', 'react', 'vue'];

  frameworksVersion = {
    angular: ['1.1.1', '1.2.1', '1.3.3'],
    react: ['2.1.2', '3.2.4', '4.3.1'],
    vue: ['3.3.1', '5.2.1', '5.1.3'],
  };

  hobbyName: Array<string> = [
    'Football',
    'Volleyball',
    'Basketball',
    'Tennis',
    'Swimming',
    'Sailing',
    'Cycling',
    'Yoga',
    'Pilates',
    'Rock Climbing',
  ];

  hobbyDuration: Array<string> = [
    '5 or more years',
    '4 years',
    '3 years',
    '2 years',
    '1 year',
    'more than 6 months',
    'less than 6 months',
    '2 months',
    '1 month',
    '1 week',
  ];

  selectedFramework!: string;
  hobbyTouched: boolean = false;

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      firstName: [null, [Validators.required, Validators.minLength(2)]],
      lastName: [null, [Validators.required, Validators.minLength(2)]],
      dateOfBirth: [null, [Validators.required]],
      frameworks: [null, [Validators.required]],
      frameworksVersion: [null, [Validators.required]],
      hobby: this.fb.array([]),
      email: [
        null,
        [
          Validators.required,
          Validators.pattern(
            /^([a-zA-Z0-9_.\-])+@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,9})+$/
          ),
        ],
        [this.emailExistsValidator()],
      ],
    });

    this.userForm.valueChanges?.subscribe(() => this.onValueChanged());
  }

  get hobby(): FormArray {
    return this.userForm.controls['hobby'] as FormArray;
  }

  createHobbyGroup() {
    let hobbyForm = this.fb.group({
      name: [null, [Validators.required]],
      duration: [null, [Validators.required]],
    });
    this.hobby.push(hobbyForm);
  }

  validateHobby(index: number) {
    const hobbyArray = this.userForm.get('hobby') as FormArray;
    const hobbyGroup = hobbyArray.at(index) as FormGroup;

    const controlsToCheck = [
      hobbyGroup.get('name'),
      hobbyGroup.get('duration'),
    ];

    controlsToCheck.forEach((control) => {
      if (control) {
        if (!control.value && control.touched && !control.valid) {
          this.formError.hobby = this.validationErrorMessage.hobby.required;
        } else {
          this.formError.hobby = '';
        }
      }
    });
  }

  checkEmailExists(email: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'applicayion/json' });
    let params = new HttpParams();
    const option = { headers, params };

    if (this.userEmail?.email) {
      params = params.set('email', this.userEmail.email);
    }

    return this.http.get<EmailsInterface[]>(`/emails`, option).pipe(
      map(
        (res: EmailsInterface[]) => {
          return res.some((existingEmail) => existingEmail.email === email);
        },
        catchError(() => of(false))
      )
    );
  }

  emailExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const value = control.value;

      return this.checkEmailExists(value).pipe(
        map((exists) => {
          if (exists) {
            return { notAllowedEmail: { value } };
          } else {
            return null;
          }
        }),
        catchError(() => of(null))
      );
    };
  }

  onValueChanged() {
    const form = this.userForm;

    Object.keys(this.formError).forEach((fieldName) => {
      const control = form.get(fieldName);

      if (fieldName !== 'hobby') {
        this.formError[fieldName] = '';

        if (control?.invalid && (control.touched || control.dirty)) {
          const message = this.validationErrorMessage[fieldName];

          Object.keys(control.errors as ValidationErrors).forEach((key) => {
            this.formError[fieldName] += message[key] + '';
          });
        }
      }
    });
  }

  // addEmailData(data: any) {
  //   const headers = new HttpHeaders({ 'Content-Type': 'applicayion/json' });
  //   const option = { headers };
  //   return this.http.post('/emails', data, option).pipe(
  //     map((res) => {
  //       return res;
  //     })
  //   );
  // }

  onSubmit() {
    console.log(this.userForm.valid);
    console.log(this.userForm.value);

    if (this.userForm.valid) {
      this.userForm.reset();
    }
  }
}
