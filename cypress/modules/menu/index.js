class Menu{
    navegarParaLogin(){
        cy.get('a[href="/login"]')
    }

    efetuarLogout(){
        cy.get('a[href="/logout"]').should('be.visible').click()
    }
}

export default new Menu()