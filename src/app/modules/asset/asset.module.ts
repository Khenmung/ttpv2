import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssetRoutingModule, AssetsComponents } from './asset-routing.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPrintModule } from 'ngx-print';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedhomepageModule } from '../sharedhomepage.module';


@NgModule({
  declarations: [AssetsComponents],
  imports: [
    CommonModule,
    AssetRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule,
    SharedhomepageModule,
    NgxPrintModule,
    FlexLayoutModule
  ],
  exports:[AssetsComponents]
})
export class AssetModule { }
