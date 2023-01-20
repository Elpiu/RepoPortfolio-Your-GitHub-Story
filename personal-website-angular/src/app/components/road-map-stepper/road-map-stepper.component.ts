import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-road-map-stepper',
  styleUrls: ['./road-map-stepper.component.scss'],
  templateUrl: 'road-map-stepper.component.html'
})
export class RoadMapStepperComponent {
  @Input() colorItemList ?: string
  @Input() colorBackground ?: string

  public visible: boolean[]
  public focusIs: number
  public events:number = 3

  constructor() {
    if (!this.colorItemList) this.colorItemList = "#1abc9c"
    if (!this.colorBackground) this.colorBackground = "#2c3e50"
    this.events === 0 ? this.focusIs = -1 : this.focusIs = 0

    this.visible = new Array(this.events);
    this.visible.fill(false);
  }

  toggleCollapse(i: number): void {
    this.visible[i] = !this.visible[i];
  }


}
