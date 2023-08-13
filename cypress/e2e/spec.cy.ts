/// <reference types="cypress" />


describe('template spec', () => {
  it('passes', () => {  
    cy.visit('https://ttp.ttpsolutions.in')
    cy.get('#mat-input-0').type('Vktawnahigh@gmail.com')
    cy.get('#mat-input-1').type('Vktawnahigh@12345')
    cy.get('.mat-accent > .mat-mdc-button-touch-target').click()
    cy.window().then(({localStorage})=>{
      console.log(localStorage)
      cy.get('#mat-select-value-7').should('have.value','Education Management')
      //cy.get('.mat-mdc-form-field.ng-tns-c1205077789-13 > .mat-mdc-text-field-wrapper').click()//.select("Education Management");
      //cy.get('[formControlName="searchApplicationId"]').click()
      //cy.get('#mat-option-1 > .mdc-list-item__primary-text').select
    })
    
    //cy.findByPlaceholderText('Application',{timeout:8000}).click()
    //cy.contains('Application',{timeout:8000}).eq(1).click();
    //cy.get('input[placeholder*="Application"]',{timeout:6000}).click();
    //cy.get('#mat-select-6',{"timeout":8000}).select('Education Management')//.should('have.value','Education Management')
  })
  // it('dashboard test',()=>{
  //   cy.get('#mat-select-6',{"timeout":8000}).select('Education Management')//.should('have.value','Education Management')
  //   //cy.get('#mat-select-value-11 > .mat-mdc-select-placeholder',{"timeout":7000}).click()
  //   //cy.get('.mat-mdc-select-placeholder').click()
  //   //cy.get('#mat-option-5 > .mdc-list-item__primary-text').click()
  //   //cy.get('form.ng-valid > .mdc-button > .mat-mdc-button-touch-target').click()
  // })
})