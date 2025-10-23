import {faker} from '@faker-js/faker'

class login{
    preencherFormularioDePreCadastro(){
        const firstName = faker.person.firstName()
        const lastName = faker.person.lastName()
       
         cy.get('[data-qa="signup-name"]').type('qazando')
         cy.get('[data-qa="signup-email"]').type(getRandomEmail())

         cy.contains('button', 'Signup').click()
    }

    preencherFormularioDeLogin(user, password){
        cy.get(`[data-qa="login-email"]`).type(user)
        cy.get(`[data-qa="login-password"]`).type(password)

        cy.get(`[data-qa="login-button"]`).click
    }
}

export default new login()
