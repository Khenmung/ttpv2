import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GlobaladmininvoiceComponents, GlobaladmininvoiceRoutingModule } from './globaladmininvoice-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material/material.module';
import { SharedModule } from '../../shared/shared.module';
import { SharedhomepageModule } from '../sharedhomepage.module';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
  declarations: [GlobaladmininvoiceComponents],
  imports: [
    CommonModule,
    GlobaladmininvoiceRoutingModule,
    ReactiveFormsModule,
    MaterialModule,
    FormsModule,
    SharedModule,
    SharedhomepageModule,
    FlexLayoutModule
  ],
  exports:[
    GlobaladmininvoiceComponents
  ]
})
export class GlobaladmininvoiceModule { }
