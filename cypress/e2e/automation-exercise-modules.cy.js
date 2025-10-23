/// <reference types="cypress" />

import userData from '../fixtures/example.json'
import {getRandomNumber, getRandomEmail} from '../support/helpers'
import {faker} from '@faker-js/faker'
import menu from '../modules/menu'
import login from '../modules/login'
import cadastro from '../modules/cadastro'


describe('Automation Exercise', () => {
    beforeEach(() =>{
        cy.viewport('iphone-xr')
        cy.visit('https://automationexercise.com/')
        menu.navegarParaLogin()
    });


    it('Cadastrar um usuário', () => {

   
      
        login.preencherFormularioDePreCadastro()
        cadastro.preencherFormularioDeCadastroCompleto()
      
         // validação -> Assert
         cy.url().should('includes', 'account_created')
         cy.contains('b', 'Account Created!')
         cy.get('h2[data-qa="account-created').should('have.text', 'Account Created!')
        
    });

    it('Login de Usuário com e-mail e senha corretos ', () => {


     login.preencherFormularioDeLogin(userData.user, userData.password)
     
        cy.get('i.fa-user').parent().should('contain', userData.name)
        cy.get('a[href="/logout"]').should('be.visible')
        cy.contains('b', 'QA Tester')

        cy.get(':nth-child(10) > a')
        .should('be.visible')
        .and('have.text', `Logged in as ${userData.name}`);

        cy.contains('b', userData.name)
        cy.contains(`Logged in as ${userData.name}`).should('be.visible')
        
    });

    it('Login de Usuário com e-mail e senha incorretos', () => {

        login.preencherFormularioDeLogin(userData.user, '2564')

        cy.get('.login-form > form > p').should('contain', 'Your email or password is incorrect')        
    });

    it('Logout de Usuário com e-mail e senha corretos ', () => {

        login.preencherFormularioDeLogin(userData.user, userData.password)
        menu.efetuarLogout()
       
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