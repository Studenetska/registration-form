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

import { FormDataService } from '../form-data.service';

@Component({
  selector: 'user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css'],
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;

  constructor(private fb: FormBuilder, private service: FormDataService) {}

  formLabels: any = {
    firstName: "Ім'я",
    lastName: 'Фамілія',
    dateOfBirth: 'Введіть дату народження',
    frameworks: 'Оберіть фреймворк',
    frameworksVersion: '',
    hobby: 'Оберіть хоббі',
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
      required: "Ім'я обов'язкове поле",
      minlength: "Ім'я повинно містити більше 2 літер",
    },
    lastName: {
      required: "Фамілія обов'язкове поле",
      minlength: 'Фамілія повинна містити більше 2 літер',
    },
    dateOfBirth: {
      required: "Дата народження обов'язкове поле",
    },
    frameworks: {
      required: 'Оберіть Framework',
    },
    frameworksVersion: {
      required: 'Оберіть Версію',
    },
    hobby: {
      required: "Хоббі обов'язкове поле",
    },
    email: {
      required: "Email обов'язкове поле",
      pattern: 'Невірний формат email адреси',
      notAllowedEmail: 'Email вже існує. Спробуйте інший email',
    },
  };

  frameworksArray: Array<string> = ['angular', 'react', 'vue'];

  frameworksVersion = {
    angular: ['1.1.1', '1.2.1', '1.3.3'],
    react: ['2.1.2', '3.2.4', '4.3.1'],
    vue: ['3.3.1', '5.2.1', '5.1.3'],
  };

  hobbyName: Array<string> = [
    'Футбол',
    'Волебол',
    'Баскетбол',
    'Теніс',
    'Плавання',
    'Плавання під вітрилами',
    'Велоспорт',
    'Йога',
    'Пілатес',
    'Альпінізм',
  ];

  hobbyDuration: Array<string> = [
    '5 і більше років',
    '4 роки',
    '3 роки',
    '2 роки',
    '1 рік',
    'більше 6 місяців',
    'менше 6 місяців',
    '2 місяці',
    '1 місяць',
    'тиждень',
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
        [this.emailExistsValidator(this.service)],
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

    // Создаем массив контролов, которые нужно проверить
    const controlsToCheck = [
      hobbyGroup.get('name'),
      hobbyGroup.get('duration'),
    ];

    // Проходим по каждому контролу и проверяем его
    controlsToCheck.forEach((control) => {
      if (control) {
        if (!control.value && control.touched && !control.valid) {
          this.formError.hobby = this.validationErrorMessage.hobby.required;
        } else {
          this.formError.hobby = ''; // Сбрасываем ошибку, если значение выбрано
        }
      }
    });
  }

  emailExistsValidator(emailService: FormDataService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const value = control.value;

      return emailService.checkEmailExists(value).pipe(
        map((exists) => {
          if (exists) {
            // Email уже существует на сервере
            return { notAllowedEmail: { value } };
          } else {
            // Email не существует на сервере
            return null;
          }
        }),
        catchError(() => of(null)) // В случае ошибки считаем, что email не существует
      );
    };
  }

  // onValueChanged() {
  //   const form = this.userForm;

  //   const hobbyArray = form.get('hobby') as FormArray;

  //   if (hobbyArray && Array.isArray(hobbyArray.controls)) {
  //     hobbyArray.controls.forEach((hobbyGroup: AbstractControl) => {
  //       if (hobbyGroup instanceof FormGroup) {
  //         const nameControl = hobbyGroup.get('name');
  //         const durationControl = hobbyGroup.get('duration');

  //         if (nameControl && durationControl) {
  //           const nameValue = nameControl.value;
  //           const durationValue = durationControl.value;

  //           // Далее можно выполнять необходимую логику в зависимости от значений.
  //         }
  //       }
  //     });
  //   }

  //   Object.keys(this.formError).forEach((fieldName) => {
  //     const control = form.get(fieldName);

  //     this.formError[fieldName] = '';

  //     if (control?.invalid && (control.touched || control.dirty)) {
  //       const message = this.validationErrorMessage[fieldName];

  //       Object.keys(control.errors as ValidationErrors).forEach((key) => {
  //         this.formError[fieldName] += message[key] + '';
  //       });
  //     }
  //   });
  // }

  onValueChanged() {
    const form = this.userForm;

    // Проверьте поля формы, кроме полей хобби
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

  onSubmit() {
    console.log(this.userForm.valid);
    console.log(this.userForm.value);

    if (this.userForm.valid) {
      this.userForm.reset();
    }
  }
}
