import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-item-chip-drag',
  template: `
    <div class="igx-chip-item" [id]="id" [draggable]="draggable">
      <div class="btn btn-light btn-rounded rounded-5">
        {{ text }}
      </div>
    </div>
  `,
  styles: [`
    .igx-chip-item {
      display: inline-block;
      margin-right: 5px;
    }
  `]
})
export class ItemChipDragComponent {
  @Input() id !: string;
  @Input() text !: string;
  @Input() draggable !: boolean;

}

