/// <reference types="cypress" />

import userData from '../fixtures/example.json'
import {getRandomNumber, getRandomEmail} from '../support/helpers'
import {faker} from '@faker-js/faker'



describe('Automation Exercise', () => {
    beforeEach(() =>{
        cy.viewport('iphone-xr')
        cy.visit('https://automationexercise.com/')
        cy.get('a[href="/login"]').click()
    });

    it('Exemplos de Logs', () => {
        cy.log(`STEP 1 :: PGATS AUTOMACAO WEB CY LOG`)
        cy.log(`STEP 2 :: PGATS AUTOMACAO WEB CY LOG`)

        throw new Error("");
        
    });
    it.only('Cadastrar um usuário', () => {
        const timestamp = new Date().getTime()

         cy.get('[data-qa="signup-name"]').type('qazando')
         cy.get('[data-qa="signup-email"]').type(`qazando-${timestamp}@test.com`)

         cy.contains('button', 'Signup').click()

         cy.get('input[type=radio]').check('Mrs')

         cy.get('input#password').type('123456', { log: false})

         // para comboboxes ou selects -> select
         cy.get('[data-qa=days]').select('20')
         cy.get('[data-qa=months').select('September')
         cy.get('[data-qa=years').select('1992')

         // radio ou checkboxes -> check

         cy.get('input[type=checkbox]#newsletter').check()
         cy.get('input[type=checkbox]#optin').check()

         // Address Information

         cy.get('input#first_name').type(faker.person.firstName())
         cy.get('input#last_name').type(faker.person.lastName())
         cy.get('input#company').type(`PGATS ${faker.company.name()}`)
         cy.get('input#address1').type(faker.location.streetAddress())
         cy.get('select#country').select('Canada')
         cy.get('input#state').type(faker.location.state())
         cy.get('input#city').type(faker.location.city())
         cy.get('[data-qa="zipcode"]').type(faker.location.zipCode())
         cy.get('[data-qa="mobile_number').type('111 222 333')

         cy.get('[data-qa="create-account"]').click()

         // validação -> Assert
         cy.url().should('includes', 'account_created')
         cy.contains('b', 'Account Created!')

        // consulta ao banco

        
    });

    it('Login de Usuário com e-mail e senha corretos ', () => {


        cy.get(`[data-qa="login-email"]`).type(`qazando-1760031008584@test.com`)
        cy.get(`[data-qa="login-password"]`).type(`12345`)

        cy.get(`[data-qa="login-button"]`).click

        cy.get('i.fa-user').parent().should('contain', 'QA Tester')
        cy.get('a[href="/logout"]').should('be.visible')
        cy.contains('b', 'QA Tester')

        cy.get(':nth-child(10) > a')
        .should('be.visible')
        .and('have.text', `Logged in as QA Tester`);

        cy.contains('b', 'QA Tester')
        cy.contains(`Logged in as QA Tester`).should('be.visible')
        cy.contains('Logged in as QA Tester').should('be.visible')
        
    });

    it('Login de Usuário com e-mail e senha incorretos', () => {

        cy.get(`[data-qa="login-email"]`).type(`qazando-17600584@test.com`)
        cy.get(`[data-qa="login-password"]`).type(`12322`)

        cy.get(`[data-qa="login-button"]`).click

        cy.get('.login-form > form > p').should('contain', 'Your email or password is incorrect')        
    });

    it('Logout de Usuário com e-mail e senha corretos ', () => {


        cy.get(`[data-qa="login-email"]`).type(`qazando-1760031008584@test.com`)
        cy.get(`[data-qa="login-password"]`).type(`12345`)

        cy.get(`[data-qa="login-button"]`).click

        cy.get('i.fa-user').parent().should('contain', 'QA Tester')
        cy.get('a[href="/logout"]').should('be.visible').click()
       
        // Assert
        cy.url().should('contain', 'login' )
        cy.contains('Login to your account')

        cy.get('a[href="/logout"]').should('not.exist')
        cy.get('a[href="/login"]').should('contain','Signup / Login')
        
    });

    it('Cadastrar Usuário com e-mail existente no sistema', () => {
        // Arrange

        cy.get(`[data-qa="signup-name"]`).type('QA Tester')
        cy.get(`[data-qa="signup-email"]`).type('qazando-1760031008584@test.com')

        cy.contains('button', 'Signup').click()

        cy.get('.signup-form > form > p').should('contain', 'Email Address already exist')
        
    });

    it('Enviar um Formulário de Contato com upload de arquivo', () => {
        cy.get('a[href*=contact]').click()

        cy.get('[data-qa="name"]').type(userData.name)
        cy.get('[data-qa="email"]').type(userData.email)
        cy.get('[data-qa="subject"]').type(userData.subject)
        cy.get('[data-qa="message"]').type(userData.message)

        cy.fixture('example.json').as('arquivo')
        cy.get('input[type=file]').selectFile('@arquivo')

        cy.get('[data-qa="submit-button"]').click()

        // Asserts
        cy.get('.status').should('be.visible')
        cy.get('.status').should('have.text', 'Success! Your details have been submitted successfully.')
        
    });
    
});