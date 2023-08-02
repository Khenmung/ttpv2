import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AreaComponent } from './widgets/area/area.component';
import { MaterialModule } from './material/material.module';
import { AutofocusDirective } from './autofocus.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { EncodeHTMLPipe } from '../encode-html.pipe';
import { GrdFilterPipe } from './gridfilter';
import { ConfirmDialogComponent } from './components/mat-confirm-dialog/mat-confirm-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
    declarations: [
        AreaComponent,
        AutofocusDirective,
        EncodeHTMLPipe,
        GrdFilterPipe,
        ConfirmDialogComponent
    ],
    imports: [
        CommonModule,
        //BrowserAnimationsModule,
        MatDialogModule,
        FlexLayoutModule,
        MaterialModule,
        //MultiLevelMenuModule,
        FormsModule,
        ReactiveFormsModule,
        MatProgressBarModule,
        MatSidenavModule
    ],
    exports: [
        AreaComponent,
        EncodeHTMLPipe,
        ConfirmDialogComponent
    ]
})
export class SharedModule { }
