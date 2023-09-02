import { Injectable } from "@angular/core";
import { ContentService } from "../../../shared/content.service";
import { NaomitsuService } from "../../../shared/databaseService";
import { globalconstants } from "../../../shared/globalconstant";
import { TokenStorageService } from "../../../_services/token-storage.service";
//import {SwUpdate} from '@angular/service-worker';
@Injectable({
    providedIn: 'root'
})
export class StudentActivity {
    ELEMENT_DATA :any[]= [];
    PageLoading=true;
    loading = false;
    LoginUserDetail :any[]= [];
    SelectedBatchId = 0;SubOrgId = 0;
    constructor(//private servicework: SwUpdate,
        private token: TokenStorageService,
        private dataservice: NaomitsuService,
        private contentservice: ContentService,

    ) {
        this.LoginUserDetail = this.token.getUserDetail();
        this.SelectedBatchId = +this.token.getSelectedBatchId()!;
    }

    save(ELEMENT_DATA) {
        var toInsert :any[]= [];
        debugger;
        ELEMENT_DATA.forEach(row => {
            toInsert.push({
                StudentEvaluationId: 0,
                StudentClassId: row.StudentClassId,
                ClassEvaluationId: +row.ClassEvaluationId,
                RatingId: 4588,
                Detail: row.Detail,
                Active: 1,
                OrgId: this.LoginUserDetail[0]["orgId"],
                SubOrgId: this.SubOrgId,
                ActivityDate: new Date(row.ActivityDate),
                CreatedBy: this.LoginUserDetail[0]["userId"],
            });
        });
        console.log("toInsert", toInsert)
        this.dataservice.postPatch('StudentEvaluations', toInsert, 0, 'post')
            .subscribe((result: any) => {
                this.loading = false; this.PageLoading=false;
                this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

            }, error => console.log(error))
    }
}