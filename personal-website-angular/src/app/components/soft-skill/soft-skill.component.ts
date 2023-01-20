import {Component, Input, OnInit} from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import arrayShuffle from 'array-shuffle';
import {Softskill} from "../../mapper/database-info";

@Component({
  selector: 'app-soft-skill',
  styleUrls: ['./soft-skill.component.scss'],
  template: `
    <div cdkDropListGroup class="row text-center pt-2 correct" style="background-color: #1abc9c">
      <h1 class="mb-3 text-white">SOFT SKILL</h1>
      <div class="text-white">
        <i class="fas fa-3x fa-ellipsis-h"></i>
        &nbsp;&nbsp;
        <i class="fas fa-3x fa-id-card"></i>
        &nbsp;&nbsp;
        <i class="fas fa-3x fa-ellipsis-h"></i>
      </div>
      <div class="col m-2">
        <div
          cdkDropList
          [cdkDropListData]="list1"
          class="example-list"
          (cdkDropListDropped)="drop($event)">
          <div style="background-color: #2c3e50"
               class="btn-rounded btn text-white m-1" *ngFor="let item of list1" cdkDrag>{{item}}</div>
        </div>
      </div>

      <div class="example-container col">
        <div
          cdkDropList
          [cdkDropListData]="list2"
          class="example-list"
          (cdkDropListDropped)="drop($event)">
          <div style="background-color: #2c3e50"
               class="btn-rounded btn text-white m-1" *ngFor="let item of list2" cdkDrag>{{item}}</div>
        </div>
      </div>
    </div>
  `
})
export class SoftSkillComponent implements OnInit {

  @Input() listOfSkills !: Softskill
  public list1: string[] = []
  public list2: string[] = []

  constructor() {

  }


  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  ngOnInit(): void {
    let varArrayOfString = Object.values(this.listOfSkills)
    varArrayOfString =  arrayShuffle(varArrayOfString)
    this.list1 = varArrayOfString.slice(0, Math.floor(varArrayOfString.length / 2))
    this.list2 = varArrayOfString.slice(Math.floor(varArrayOfString.length / 2))
  }

}
