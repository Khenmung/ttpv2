import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NaomitsuService } from './databaseService';
import { List } from './interface';

@Injectable({
  providedIn: 'root'
})
export class SharedataService {
  items = [];
  BatchId = 0;
  StudentId = 0;
  StudentClassId = 0;
  
  private MasterItemsource = new BehaviorSubject(this.items);
  private CurrentBatchIdSource = new BehaviorSubject(0);
  private BatchSource = new BehaviorSubject(this.items);
  private CountrySource = new BehaviorSubject(this.items);
  private GendersSource = new BehaviorSubject(this.items);
  private BloodgroupSource = new BehaviorSubject(this.items);
  private CategorySource = new BehaviorSubject(this.items);
  private ReligionSource = new BehaviorSubject(this.items);
  private StatesSource = new BehaviorSubject(this.items);
  private LocationSource = new BehaviorSubject(this.items);
  private PrimaryContactSource = new BehaviorSubject(this.items);
  private SectionSource = new BehaviorSubject(this.items);
  private FeeTypeSource = new BehaviorSubject(this.items);
  private LanguageSubjectUpperSource = new BehaviorSubject(this.items);
  private LanguageSubjectLowerSource = new BehaviorSubject(this.items);
  private FeeDefinitionsSource = new BehaviorSubject(this.items);
  private StudentNameSource = new BehaviorSubject('');
  private EmployeeNameSource = new BehaviorSubject('');
  private UploadTypeSource = new BehaviorSubject(this.items);
  private PagesDataSource = new BehaviorSubject(this.items);
  private NewsNEventIdSource = new BehaviorSubject(-1);
  private ReasonForLeavingSource = new BehaviorSubject(this.items);
  private RandomImagesSource = new BehaviorSubject(this.items);
  private OrganizationSource = new BehaviorSubject(this.items);
  private DepartmentSource = new BehaviorSubject(this.items);
  private RolesSource = new BehaviorSubject(this.items);
  private AppUsersSource = new BehaviorSubject(this.items);
  private OrganizationMastersSource = new BehaviorSubject(this.items);
  private ApplicationRolesSource = new BehaviorSubject(this.items);
  private SubjectsSource = new BehaviorSubject(this.items);
  private SubjectTypesSource = new BehaviorSubject(this.items);
  private SelectedNCurrentBatchIdEqualSource = new BehaviorSubject(0);
  private PreviousBatchIdOfSelecteBatchIdSource = new BehaviorSubject(0);
  private NextBatchIdOfSelecteBatchIdSource = new BehaviorSubject(0);  
  private StudentClassIdSource = new BehaviorSubject(0);  
  private StudentIdSource = new BehaviorSubject(0);  
  private SelectedBatchStartEndSource = new BehaviorSubject(this.items);  
  private CurrentBatchStartEndSource = new BehaviorSubject(this.items);  
  private CustomerPlanSource = new BehaviorSubject(this.items);  
  private UserInfoSource = new BehaviorSubject(this.items);  
  private PermissionAtParentSource = new BehaviorSubject('');  
  private HouseSource = new BehaviorSubject(this.items);  

  CurrentHouse = this.HouseSource.asObservable(); 

  CurrentPermissionAtParent = this.PermissionAtParentSource.asObservable(); 

  CurrentUserInfo = this.UserInfoSource.asObservable(); 

  CurrentCustomerPlan = this.CustomerPlanSource.asObservable(); 
  CurrentCurrentBatchStartEnd = this.CurrentBatchStartEndSource.asObservable(); 
  CurrentSelectedBatchStartEnd$ = this.SelectedBatchStartEndSource.asObservable(); 
  //CurrentApplicationId = this.ApplicationIdSource.asObservable(); 

  CurrentNextBatchIdOfSelecteBatchId = this.NextBatchIdOfSelecteBatchIdSource.asObservable(); 
  CurrentPreviousBatchIdOfSelecteBatchId = this.PreviousBatchIdOfSelecteBatchIdSource.asObservable(); 
  CurrentSelectedNCurrentBatchIdEqual = this.SelectedNCurrentBatchIdEqualSource.asObservable(); 
  CurrentSubjectTypes = this.SubjectTypesSource.asObservable();   
  CurrentSubjects = this.SubjectsSource.asObservable(); 
  CurrentApplicationRoles = this.ApplicationRolesSource.asObservable(); 
  CurrentOrganizationMasters = this.OrganizationMastersSource.asObservable(); 
  CurrentAppUsers = this.AppUsersSource.asObservable(); 
 
  CurrentRoles = this.RolesSource.asObservable(); 
  //CurrentPermittedApplications = this.PermittedApplicationsSource.asObservable();
  
  CurrentDepartment = this.DepartmentSource.asObservable();
  CurrentOrganization = this.OrganizationSource.asObservable();
  CurrentRandomImages = this.RandomImagesSource.asObservable();
  //CurrentSelectedBatchId = this.SelectedBatchIdSource.asObservable();
  CurrentReasonForLeaving = this.ReasonForLeavingSource.asObservable();

  CurrentNewsNEventId = this.NewsNEventIdSource.asObservable();
  CurrentPagesData = this.PagesDataSource.asObservable();
  CurrentUploadType = this.UploadTypeSource.asObservable();  
  CurrentFeeDefinitions = this.FeeDefinitionsSource.asObservable();  
  CurrentLanguageSubjectLower = this.LanguageSubjectLowerSource.asObservable();
  CurrentLanguageSubjectUpper = this.LanguageSubjectUpperSource.asObservable();
  CurrentFeeType = this.FeeTypeSource.asObservable();
  CurrentSection = this.SectionSource.asObservable();
  CurrentPrimaryContact = this.PrimaryContactSource.asObservable();
  CurrentMasterData = this.MasterItemsource.asObservable();
  //CurrentBatchId = this.CurrentBatchIdSource.asObservable();
  //CurrentBatch = this.BatchSource.asObservable();
  CurrentStudentId = this.StudentIdSource.asObservable();
  CurrentStudentClassId = this.StudentClassIdSource.asObservable();
  CurrentCountry = this.CountrySource.asObservable();
  CurrentGenders = this.GendersSource.asObservable();
  CurrentBloodgroup = this.BloodgroupSource.asObservable();
  CurrentCategory = this.CategorySource.asObservable();
  CurrentReligion = this.ReligionSource.asObservable();
  CurrentStates = this.StatesSource.asObservable();
  CurrentLocation = this.LocationSource.asObservable();
  //CurrentClasses = this.ClassesSource.asObservable();
  CurrentStudentName = this.StudentNameSource.asObservable();
  CurrentEmployeeName = this.EmployeeNameSource.asObservable();
  
  constructor(
    private dataservice:NaomitsuService
  ) {
  }
  ngOnInit() {

  }
  ChangeHouse(item){
    this.HouseSource.next(item);
  }
  ChangePermissionAtParent(item){
    this.PermissionAtParentSource.next(item);
  }
  ChangeUserInfo(item){
    this.UserInfoSource.next(item);
  }
  ChangeCustomerPlan(item){
    this.CustomerPlanSource.next(item);
  }
  ChangeCurrentBatchStartEnd(item){
    this.CurrentBatchStartEndSource.next(item);
  }
  ChangeSelectedBatchStartEnd(item){
    this.SelectedBatchStartEndSource.next(item);
  }
  // ChangeApplicationId(item){
  //   this.ApplicationIdSource.next(item);
  // }
  ChangeNextBatchIdOfSelecteBatchId(item){
    this.NextBatchIdOfSelecteBatchIdSource.next(item);
  }
  ChangePreviousBatchIdOfSelecteBatchId(item){
    this.PreviousBatchIdOfSelecteBatchIdSource.next(item);
  }
  ChangeSelectedNCurrentBatchIdEqual(item){
    this.SelectedNCurrentBatchIdEqualSource.next(item);
  }
  ChangeSubjects(item){
    this.SubjectsSource.next(item);
  }
  ChangeSubjectTypes(item){
    this.SubjectTypesSource.next(item);
  }

  ChangeApplicationRoles(item){
    this.ApplicationRolesSource.next(item);
  }
  ChangeOrganizationMasters(item){
    this.OrganizationMastersSource.next(item);
  }
  ChangeAppUsers(item){
    this.AppUsersSource.next(item);
  }
  ChangeRoles(item){
    this.RolesSource.next(item);
  }
  // ChangePermittedApplications(item){
  //   this.PermittedApplicationsSource.next(item);
  // }
  ChangeOrganization(item){
    this.OrganizationSource.next(item);
  }
  ChangeDepartment(item){
    this.DepartmentSource.next(item);
  }
  ChangeRandomImages(item){
    this.RandomImagesSource.next(item);
  }
  // ChangeSelectedBatchId(item){
  //   this.SelectedBatchIdSource.next(item);
  // }
  ChangeReasonForLeaving(item){
    this.ReasonForLeavingSource.next(item);
  }
  ChangeNewsNEventId(item)
  {
    this.NewsNEventIdSource.next(item);
  }
  ChangePageData(item)
  {
    this.PagesDataSource.next(item);
  }
  ChangeUploadType(item)
  {
    this.UploadTypeSource.next(item);
  }
  ChangeStudentName(item)
  {
    this.StudentNameSource.next(item);
  }
  ChangeEmployeeName(item)
  {
    this.EmployeeNameSource.next(item);
  }
  ChangeFeeDefinition(item)
  {
    this.FeeDefinitionsSource.next(item);
  }
  ChangeLanguageSubjectLower(item){

   this.LanguageSubjectLowerSource.next(item);
  }
  ChangeLanguageSubjectUpper(item){

   this.LanguageSubjectUpperSource.next(item);
  }
  ChangeFeeType(item){

   this.FeeTypeSource.next(item);
  }
  ChangeSection(item){

   this.SectionSource.next(item);
  }
  ChangePrimaryContact(item){
    this.PrimaryContactSource.next(item);
  }
  ChangeMasterData(item) {

    this.MasterItemsource.next(item);
  }
  ChangeCurrentBatchId(item) {

    this.CurrentBatchIdSource.next(item);
  }
  // ChangeBatch(item) {
  //   this.BatchSource.next(item);
  // }
  ChangeStudentId(item) {
    this.StudentIdSource.next(item);
  }
  ChangeStudentClassId(item) {
    this.StudentClassIdSource.next(item);
  }
  ChangeCountry(item) {
    this.CountrySource.next(item);
  }
  ChangeGenders(item) {
    this.GendersSource.next(item);
  }
  ChangeBloodgroup(item) {
    this.BloodgroupSource.next(item);
  }
  ChangeCategory(item) {
    this.CategorySource.next(item);
  }
  ChangeReligion(item) {
    this.ReligionSource.next(item);
  }
  ChangeStates(item) {
    this.StatesSource.next(item);
  }
  ChangeLocation(item) {
    this.LocationSource.next(item);
  }
  // ChangeClasses(item) {
  //   this.ClassesSource.next(item);
  // }
  // GetApplication() {
  //   let list: List = new List();
  //   list.fields = ["ApplicationId", "ApplicationName", "Active"];
  //   list.PageName = "Applications";
  //   list.filter = ["Active eq 1"];
    
  //   return this.dataservice.get(list);//.toPromise();
      
  //   }
  clearData() {
    this.items = [];
    return this.items;
  }
}