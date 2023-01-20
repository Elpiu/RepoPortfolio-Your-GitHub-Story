import {ChangeDetectorRef, Component} from '@angular/core';
import { IBaseChipEventArgs, IChipsAreaReorderEventArgs } from 'igniteui-angular';

@Component({
  selector: 'app-soft-skill',
  styleUrls: ['./soft-skill.component.scss'],
  template: `
      <div class="p-4 bg-success row">
          <igx-chips-area (reorder)="chipsOrderChanged($event)"
            class="col"
          >
              <igx-chip
                      *ngFor="let chip of chipList"
                      [id]="chip.id"
                      [draggable]="true">
                  <div class="btn btn-light btn-rounded rounded-5">
                      {{chip.text}}
                  </div>
              </igx-chip>
          </igx-chips-area>
      </div>
      https://material.angular.io/cdk/drag-drop/overview
  `
})
export class SoftSkillComponent {
  public chipList = [
    {
      text: 'Country',
      id: '1',
    },
    {
      text: 'City',
      id: '2',
    },
  ];

  constructor() { }


  public chipsOrderChanged(event: IChipsAreaReorderEventArgs) {
    const newChipList = [];
    for (const chip of event.chipsArray) {
      const chipItem = this.chipList.filter((item) => item.id === chip.id)[0];
      newChipList.push(chipItem);
    }
    this.chipList = newChipList;
  }

}
