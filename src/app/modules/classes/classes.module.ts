import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassesComponents, ClassesRoutingModule } from './classes-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
  declarations: [ClassesComponents],
  imports: [
    CommonModule,
    ClassesRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    SharedhomepageModule,
    MaterialModule,
    FlexLayoutModule
  ],
  exports:[ClassesComponents]
})
export class ClassesModule { }
