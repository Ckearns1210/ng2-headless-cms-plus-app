import {Component} from '@angular/core';
import {MD_INPUT_DIRECTIVES} from '@angular2-material/input';
import {MdButton} from '@angular2-material/button';
import {MdCard} from '@angular2-material/card';
import {MdCheckbox} from '@angular2-material/checkbox';
import {MdToolbar} from '@angular2-material/toolbar';


let max = 5;

@Component({
  selector: 'input-demo',
  template: require('./input-demo.html'),
  styles: [require('./input-demo.scss')],
  directives: [MdCard, MdCheckbox, MdButton, MdToolbar, MD_INPUT_DIRECTIVES]
})
export class InputDemo {
  dividerColor: boolean;
  requiredField: boolean;
  floatingLabel: boolean;
  name: string;
  items: any[] = [
    { value: 10 },
    { value: 20 },
    { value: 30 },
    { value: 40 },
    { value: 50 }
  ];

  addABunch(n: number) {
    for (let x = 0; x < n; x++) {
      this.items.push({ value: ++max });
    }
  }
}
