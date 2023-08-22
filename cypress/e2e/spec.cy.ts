/// <reference types="cypress" />


describe('template spec', () => {
  it.skip('create new student', () => {
    cy.intercept('**/odata/*')
      .as('todos')

    cy.visit('/')
    cy.get('#mat-input-0').type('Vktawnahigh@gmail.com')
    cy.get('#mat-input-1').type('Vktawnahigh@12345')
    cy.get('.mat-accent > .mat-mdc-button-touch-target').click();
    //.then(() => {

    cy.wait('@todos')//.then(() => {
    cy.get('#ApplicationId').click()
    //})
    //cy.wait('@todos')
    //cy.wait('@todos')
    cy.get('#ApplicationId-panel mat-option').eq(1).click();
    //})

    cy.get('.mat-mdc-form-field').eq(2).click();
    cy.get('#mat-option-5').click();
    cy.get('.mat-mdc-raised-button').click();
    //})
    //})
    cy.wait('@todos');
    cy.get('#btnNewStudent').click();
    cy.get('#txtFirstName').type('Auto FirstName2');
    cy.get('#txtLastName').type('Auto LastName');
    cy.get('#txtFatherName').type('Auto FatherName', { force: true });
    cy.get('#txtFatherOccupation').type('Auto Father Occ', { force: true });
    cy.get('#txtMotherName').type('Auto MotherName', { force: true });
    cy.get('#txtMotherOccupation').type('Auto Mother Occ', { force: true });
    cy.get('#ddGender').click();
    cy.get('#ddGender-panel mat-option').eq(0).click();//M

    cy.get('#ddReligion').click();
    cy.get('#ddReligion-panel mat-option').eq(1).click();//muslim

    cy.get('#ddBloodgroup').click();
    cy.get('#ddBloodgroup-panel mat-option').eq(0).click();//blood group A

    cy.get('#ddCategory').click();
    cy.get('#ddCategory-panel mat-option').eq(2).click();//general category

    cy.get('#txtAdhaarno').type('3453435435');//adhaar no
    cy.get('#dtToggle').click();
    cy.get(':nth-child(4) > [data-mat-col="4"] > .mat-calendar-body-cell').click();
    cy.get('#mat-tab-label-1-1').click();
    cy.get('#txtPersonalNo').type('8547854785', { force: true });
    cy.get('#btnContactSave').click();
    cy.get('#mat-tab-label-0-1').click();
    cy.wait('@todos');
    cy.get('#mat-select-38-panel mat-option').eq(1).click();
    //cy.contains('Application').should('be.empty');
    //cy.wrap(cy.get('.mat-mdc-form-field').eq(0)).click();
    //cy.get('mat-select[formControlName="searchApplicationId"]').click()
    // .as('btn')
    // cy.get('@btn').siblings('mat-select')
    //   .invoke('text')
    //   .click()
    //cy.get('#mat-option-1 > .mdc-list-item__primary-text').click()
    //})
    //.then((dum) => {


    //console.log(cy.get('@btn'))
    //cy.wrap(cy.get('@btn'), { timeout: 8000 }).click()
    //})
    // cy.window().then(({localStorage})=>{
    //   console.log(localStorage)
    //   cy.get('#mat-select-value-7').should('have.value','Education Management')
    //   //cy.get('.mat-mdc-form-field.ng-tns-c1205077789-13 > .mat-mdc-text-field-wrapper').click()//.select("Education Management");
    //   //cy.get('[formControlName="searchApplicationId"]').click()
    //   //cy.get('#mat-option-1 > .mdc-list-item__primary-text').select
    // })

    //cy.findByPlaceholderText('Application',{timeout:8000}).click()
    //cy.contains('Application',{timeout:8000}).eq(1).click();
    //cy.get('input[placeholder*="Application"]',{timeout:6000}).click();
    //cy.get('#mat-select-6',{"timeout":8000}).select('Education Management')//.should('have.value','Education Management')
  })
  it('update student class', () => {
    //cy.intercept('**/odata/*').as('todos')
    cy.intercept('https://ettest.ttpsolutions.in/**').as('todos')
    cy.visit('/')
    cy.get('#mat-input-0').type('Vktawnahigh@gmail.com')
    cy.get('#mat-input-1').type('Vktawnahigh@12345')
    cy.get('.mat-accent > .mat-mdc-button-touch-target').click()

    cy.wait('@todos')
    cy.get('mat-select[formControlName="searchApplicationId"]').click().click()
    //cy.wait('@todos')
    cy.get('#ApplicationId-panel mat-option').eq(1).click();
    //})


    //cy.wait('@todos')

    //})

    cy.get('.mat-mdc-form-field').eq(2).click();
    cy.get('#mat-option-5').click();
    cy.wait('@todos')
    cy.get('.mat-mdc-raised-button').click();
    //cy.wait('@todos2').then(() => {
    cy.wait('@todos').its('response.statusCode').should('eq', 200)
    cy.url().should('eq', 'http://localhost:4200/#/edu').then(()=>{
      cy.get('#searchPID').type('1510');
      cy.get('#btnSearchStudent').click();
    })
    //})
    cy.get('button.mdc-button span').contains(' Auto FirstName Auto LastName- ').click();
    cy.wait(500);
    cy.get('div span span').contains('Class/Course ').click();
    cy.wait('@todos').its('response.statusCode').should('eq', 200);
    cy.get('mat-row').eq(0).children().eq(2).click();//clicking section dropdown
    cy.get('#mat-select-38-panel mat-option').eq(2).click();//selecting section A
    cy.get('mat-table mat-row').eq(0).children().eq(10).first().as('savebtn');
    cy.get('@savebtn').should('not.be.disabled');
    cy.get('@savebtn').click();
    cy.get('button[mattooltip="add new"').click().click();
  })
})