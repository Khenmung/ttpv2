import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssetVendorComponent } from './assetvendor/assetvendor.component';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssetRoutingModule { }
export const AssetsComponents=[
  AssetVendorComponent
]
