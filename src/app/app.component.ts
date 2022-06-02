import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  genders = ['male', 'female'];
  signupForm: FormGroup;
  forbiddenUserNames = ['Anna', 'Jane'];

  ngOnInit(): void {
      this.signupForm = new FormGroup({
        'username': new FormControl(null, [Validators.required, this.forbiddenNames.bind(this)]),
        'email': new FormControl(null, [Validators.required, Validators.email], this.forbiddenEmails),
        'gender': new FormControl('male'),
        'hobbies': new FormArray([]),
      })
      // this.setHobbies(['Cat','Dog'])
  }
  private setHobbies(hobbies) {
    for (const hobby of hobbies) {
      (<FormArray>this.signupForm.get('hobbies')).controls.push(new FormControl(hobby, Validators.required));
    }
  }
  forbiddenNames(control: FormControl): {[s: string]: boolean}{
    if (~this.forbiddenUserNames.indexOf(control.value))
      return {'nameIsForbidden': true};
    else
      return null;
  }

  forbiddenEmails(control: FormControl): Promise<any> | Observable<any>{
    const promise = new Promise( (resolve, reject) => {
      setTimeout(() => {
        if (control.value === 'test@test.com'){
          resolve({'emailIsForbbiden': true});
        }else {
          resolve(null);
        }
      },800);
    })
    return promise;
  }

  onSubmit(){
    console.log(this.signupForm)
    this.signupForm.reset({
      'gender': 'male'
    })
  }

  onAddHobby(){
    const control = new FormControl(null, Validators.required);
    (<FormArray>this.signupForm.get('hobbies')).push(control);
  }

  getControls(){
    return (<FormArray>this.signupForm.get('hobbies')).controls;
  }
}
