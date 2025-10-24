const { faker } = require('@faker-js/faker');


const BASE_URL = 'https://automationexercise.com'; 

const generateUserData = (providerSuffix = 'test.com') => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    return {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName, provider: providerSuffix }).toLowerCase(),
        password: faker.internet.password(8),
    };
};

// Se cy.fullSignup NÃO estiver em commands.js, você DEVE incluí-lo aqui
// como uma função/comando. Assumiremos que ele está em commands.js e
// que cy.contains('a', /Products/i) substitui o cy.navigateTo('Products').
// =================================================================

describe('Casos de Teste - Automation Exercise', () => {

    // Caso de Teste 1 - Registro de Usuário (CORRETO)
    it('Caso de Teste 1 - Registro de Usuário', () => {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const fullName = `${firstName} ${lastName}`;
        const email = faker.internet.email({ firstName, lastName, provider: 'automationtest.com' }).toLowerCase();
        const password = faker.internet.password(8);

        cy.visit(BASE_URL);
        
        // 1. Navegar para Signup / Login
        cy.contains('a', /Signup \/ Login/i).click({ force: true });
        cy.url().should('match', /login|signup|signin/i);

        // 2. Preencher o formulário de cadastro
        cy.contains('New User Signup!').parent().within(() => {
            cy.get('input[name="name"]').first().type(fullName, { force: true });
            cy.get('input[name="email"]').first().type(email, { force: true });
            cy.contains('button, input', /^Signup$/i).first().click({ force: true });
        });

        // 3. Verificar transição para a página de informações da conta
        cy.contains('h2', /Enter Account Information/i, { timeout: 10000 }).should('be.visible');

        // 4. Preencher detalhes da conta (simplificado)
        cy.get('#id_gender1').check({ force: true });
        cy.get('#password').type(password, { force: true });
        cy.get('#days').select('1');
        cy.get('#months').select('January');
        cy.get('#years').select('2000');
        
        cy.get('input#newsletter').check({ force: true });
        cy.get('input#optin').check({ force: true });

        // Preencher endereço
        cy.get('#first_name').type(firstName, { force: true });
        cy.get('#last_name').type(lastName, { force: true });
        cy.get('#company').type('Test Company', { force: true });
        cy.get('#address1').type('Rua Exemplo 123', { force: true });
        cy.get('#address2').type('Apto 1', { force: true });
        cy.get('#country').select('Canada', { force: true });
        cy.get('#state').type('State Example', { force: true });
        cy.get('#city').type('City Example', { force: true });
        cy.get('#zipcode').type('12345', { force: true });
        cy.get('#mobile_number').type('+5511999999999', { force: true });

        // 5. Clicar no botão 'Create Account'
        cy.contains('button, a', /Create Account/i).first().click({ force: true });

        // 6. Assegurar que a conta foi criada
        cy.contains('h2', /Account Created!/i, { timeout: 10000 }).should('be.visible');

        // 7. Clicar em 'Continue' e verificar login
        cy.contains('a', /Continue/i).first().click({ force: true });
        cy.contains('li a', new RegExp(`Logged in as ${fullName}`, 'i'), { timeout: 10000 }).should('be.visible');
    });

   

    // Caso de Teste 2 - Login de usuário com email e senha corretos (CORRETO)
    it('Caso de Teste 2 - Login de usuário com email e senha corretos', () => {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const fullName = `${firstName} ${lastName}`;
        const email = faker.internet.email({ firstName, lastName, provider: 'login.com' }).toLowerCase();
        const password = faker.internet.password(8);

        // O ideal seria usar cy.fullSignup(userData) aqui, mas para ser standalone:

        // 1. Realizar o Cadastro (setup)
        cy.visit(`${BASE_URL}/login`);
        cy.contains('New User Signup!').parent().within(() => {
            cy.get('input[name="name"]').first().type(fullName, { force: true });
            cy.get('input[name="email"]').first().type(email, { force: true });
            cy.contains('button', /^Signup$/i).first().click({ force: true });
        });

        // Preenche a tela de detalhes da conta (simplificado)
        cy.contains('h2', /Enter Account Information/i, { timeout: 10000 }).should('be.visible');
        cy.get('#id_gender1').check({ force: true });
        cy.get('#password').type(password, { force: true });
        cy.get('#first_name').type(firstName, { force: true });
        cy.get('#last_name').type(lastName, { force: true });
        cy.get('#address1').type('Rua Teste 1', { force: true });
        cy.get('#country').select('Canada', { force: true });
        cy.get('#state').type('State', { force: true });
        cy.get('#city').type('City', { force: true });
        cy.get('#zipcode').type('12345', { force: true });
        cy.get('#mobile_number').type('+551199999000', { force: true });
        cy.contains('button', /Create Account/i).first().click({ force: true });
        cy.contains('h2', /Account Created!/i, { timeout: 10000 }).should('be.visible');
        cy.contains('a', /Continue/i).first().click({ force: true });
        
        // 2. Fazer Logout
        cy.contains('a', /Logout/i).click({ force: true });
        
        // 3. Realizar o Login
        cy.contains('h2', 'Login to your account').should('be.visible');
        cy.get('input[data-qa="login-email"]').first().type(email, { force: true });
        cy.get('input[data-qa="login-password"]').first().type(password, { force: true });
        cy.contains('button', /Login/i).first().click({ force: true });

        // 4. Assert: Login bem-sucedido
        cy.contains('li a', new RegExp(`Logged in as ${fullName}`, 'i'), { timeout: 10000 }).should('be.visible');
    });

    

    // Caso de Teste 3 - Login de usuário com email e senha incorretos (CORRETO)
    it('Caso de Teste 3 - Login de usuário com email e senha incorretos', () => {
        const badEmail = `no_user_${Date.now()}@example.com`;
        const badPassword = 'incorrectPassword123!';

        cy.visit(`${BASE_URL}/login`);
        cy.contains('h2', 'Login to your account').should('be.visible');

        cy.get('input[data-qa="login-email"]').first().type(badEmail, { force: true });
        cy.get('input[data-qa="login-password"]').first().type(badPassword, { force: true });
        cy.contains('button', /Login/i).first().click({ force: true });

        cy.contains('p', /Your email or password is incorrect!/i, { timeout: 10000 }).should('be.visible');
    });

   

    // Caso de Teste 4 - Logout de usuário (CORRETO)
    it('Caso de Teste 4 - Logout de usuário', () => {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const fullName = `${firstName} ${lastName}`;
        const email = faker.internet.email({ firstName, lastName, provider: 'autologout.com' }).toLowerCase();
        const password = faker.internet.password(8);

        cy.visit(`${BASE_URL}/login`);
        cy.contains('New User Signup!').parent().within(() => {
            cy.get('input[name="name"]').first().type(fullName, { force: true });
            cy.get('input[name="email"]').first().type(email, { force: true });
            cy.contains('button', /^Signup$/i).first().click({ force: true });
        });

        // Preenche a tela de detalhes da conta (simplificado)
        cy.contains('h2', /Enter Account Information/i, { timeout: 10000 }).should('be.visible');
        cy.get('#id_gender1').check({ force: true });
        cy.get('#password').type(password, { force: true });
        cy.get('#first_name').type(firstName, { force: true });
        cy.get('#last_name').type(lastName, { force: true });
        cy.get('#address1').type('Rua Logout 1', { force: true });
        cy.get('#country').select('Canada', { force: true });
        cy.get('#state').type('State', { force: true });
        cy.get('#city').type('City', { force: true });
        cy.get('#zipcode').type('12345', { force: true });
        cy.get('#mobile_number').type('+551199999111', { force: true });
        cy.contains('button', /Create Account/i).first().click({ force: true });
        cy.contains('h2', /Account Created!/i, { timeout: 10000 }).should('be.visible');
        cy.contains('a', /Continue/i).first().click({ force: true });
        cy.contains('li a', new RegExp(`Logged in as ${fullName}`, 'i'), { timeout: 10000 }).should('be.visible');

        // 2. Fazer Logout
        cy.contains('a', /Logout/i).click({ force: true });

        // 3. Assert: Verificar que a URL é de login e o painel de login/signup está visível
        cy.url().should('include', '/login');
        cy.contains('h2', 'Login to your account').should('be.visible');
    });

    

    // Caso de Teste 5 - Registrar usuário com email já existente (CORRETO)
    it('Caso de Teste 5 - Registrar usuário com email já existente', () => {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const fullName = `${firstName} ${lastName}`;
        const existingEmail = faker.internet.email({ firstName, lastName, provider: 'autofail.com' }).toLowerCase();
        const password = faker.internet.password(8);

        // 1. Primeiro Cadastro (para gerar o email existente)
        cy.visit(`${BASE_URL}/login`);
        cy.contains('New User Signup!').parent().within(() => {
            cy.get('input[name="name"]').first().type(fullName, { force: true });
            cy.get('input[name="email"]').first().type(existingEmail, { force: true });
            cy.contains('button', /^Signup$/i).first().click({ force: true });
        });

        // Preenche a tela de detalhes da conta (simplificado)
        cy.contains('h2', /Enter Account Information/i, { timeout: 10000 }).should('be.visible');
        cy.get('#id_gender1').check({ force: true });
        cy.get('#password').type(password, { force: true });
        cy.get('#first_name').type(firstName, { force: true });
        cy.get('#last_name').type(lastName, { force: true });
        cy.get('#address1').type('Rua Existente 1', { force: true });
        cy.get('#country').select('Canada', { force: true });
        cy.get('#state').type('State', { force: true });
        cy.get('#city').type('City', { force: true });
        cy.get('#zipcode').type('54321', { force: true });
        cy.get('#mobile_number').type('+551199999222', { force: true });
        cy.contains('button', /Create Account/i).first().click({ force: true });
        cy.contains('h2', /Account Created!/i, { timeout: 10000 }).should('be.visible');
        cy.contains('a', /Continue/i).first().click({ force: true });
        cy.contains('a', /Logout/i).click({ force: true }); // Logout

        // 2. Tentar cadastrar novamente com o mesmo email
        cy.visit(`${BASE_URL}/login`);
        cy.contains('New User Signup!').parent().within(() => {
            cy.get('input[name="name"]').first().type('Another Name', { force: true });
            cy.get('input[name="email"]').first().type(existingEmail, { force: true });
            cy.contains('button', /^Signup$/i).first().click({ force: true });
        });
        
        // 3. Assert: Mensagem de erro visível
        cy.contains('p', /Email Address already exist!/i, { timeout: 10000 }).should('be.visible');
    });

    

    // Caso de Teste 6 - Formulário de Contato (CORRETO)
    it('Caso de Teste 6 - Formulário de Contato', () => {
        const name = faker.person.fullName();
        const email = faker.internet.email().toLowerCase();
        const subject = 'Dúvida de teste';
        const message = 'Mensagem de teste automatizada via Cypress.';

        // 1. Navegar para a página de contato
        cy.visit(BASE_URL);
        cy.contains('a', /Contact Us/i).click({ force: true });
        cy.url().should('include', '/contact_us');
        cy.contains('h2', /Get In Touch/i).should('be.visible');

        // 2. Preencher o formulário
        cy.get('input[data-qa="name"]').first().type(name, { force: true });
        cy.get('input[data-qa="email"]').first().type(email, { force: true });
        cy.get('input[data-qa="subject"]').first().type(subject, { force: true });
        cy.get('textarea[data-qa="message"]').first().type(message, { force: true });

        // 3. Enviar o formulário (o site geralmente requer o upload de um arquivo, mas ignoramos para simplificar o teste)
        cy.get('input[type="submit"], button[type="submit"], button', { timeout: 5000 }).contains(/Submit|Submit Form|Send/i).first().click({ force: true });
        
        // 4. Lidar com o alerta de confirmação
        cy.on('window:confirm', (str) => {
            expect(str).to.equal('Press OK to proceed!');
            return true;
        });

        // 5. Assert: Mensagem de sucesso
        cy.contains('.status', /Success! Your details have been submitted successfully/i, { timeout: 10000 }).should('be.visible');
    });

    

    // Caso de Teste 8 - Verificar todos os produtos e detalhes (CORRETO)
    it('Caso de Teste 8 - Verificar todos os produtos e a página de detalhes do produto ', () => {
        // 1. Navegar para a página de Produtos
        cy.visit(BASE_URL);
        cy.contains('a', /Products/i).click({ force: true });
        cy.url().should('include', '/products');
        cy.contains('h2', /All Products/i).should('be.visible');

        // 2. Clicar no primeiro link de detalhes do primeiro produto
        cy.get('.product-image-wrapper', { timeout: 10000 })
            .should('have.length.greaterThan', 0)
            .first().contains('a', /View Product/i).click({ force: true });

        // 3. Assert: Verificar detalhes do produto
        cy.url().should('match', /\/product_details\/\d+/i);
        cy.get('.product-information').within(() => {
            cy.get('h2').should('be.visible'); // Nome do produto
            cy.contains(/Category|Availability|Condition|Brand/i).should('be.visible');
            cy.get('span').contains('Rs.').should('be.visible'); // Preço
        });
    });

    

    // Caso de Teste 9 - Pesquisar Produto (CORRETO)
    it('Caso de Teste 9 - Pesquisar Produto', () => {
        const searchTerm = 'Dress';
        
        cy.visit(BASE_URL);
        cy.contains('a', /Products/i).click({ force: true });
        cy.url().should('include', '/products');

        cy.get('input#search_product').should('be.visible').type(searchTerm);
        cy.get('#submit_search').click({ force: true });

        cy.contains('h2', /Searched Products/i).should('be.visible');

        // Assert: Verifica se há resultados E se o termo de busca está presente.
        cy.get('.product-image-wrapper').should('have.length.greaterThan', 0);
        cy.get('.features_items').should('include.text', searchTerm);
    });

    
    // Caso de Teste 10 - Verificar Assinatura na página inicial
    it('Caso de Teste 10 - Verificar Assinatura na página inicial', () => {
        cy.visit(BASE_URL);
        cy.scrollTo('bottom');
        
        const testEmail = `newsletter_${Date.now()}@example.com`;
        
        // Seletor do campo de email de inscrição
        cy.get('input[placeholder*="email"]').first().should('be.visible').then(($input) => {
            if (!$input.length) throw new Error('Subscription input not found on homepage.');
            
            cy.wrap($input).clear().type(testEmail);
        });
        
        // SOLUÇÃO: Clicar no botão de submissão da newsletter usando o ID do botão (se for #subscribe) 
        // ou garantindo que ele não é hidden.
        cy.get('#subscribe, button[type="submit"], input[type="submit"]')
            .not('[type="hidden"]') // Explicitamente exclui inputs hidden
            .first() // Pega o primeiro botão válido encontrado
            .should('be.visible')
            .click({ force: true }); // Usar force: true é aceitável aqui se for difícil fazê-lo rolar

        cy.get('body', { timeout: 10000 }).should(($body) => {
            const ok = /You have been successfully subscribed|Subscription successful/i.test($body.text());
            expect(ok, 'Subscription confirmation not found in page body after submitting email').to.be.true;
        });
    });
    
  

    // Caso de Teste 15 - Fazer Pedido: Cadastrar-se antes de Finalizar a Compra (CORRETO)
    it('Caso de Teste 15 - Fazer Pedido: Cadastrar-se antes de Finalizar a Compra', () => {
        // Usa a função de helper
        const userData = generateUserData('checkout.com');
        const cardName = `${userData.firstName} ${userData.lastName}`;

        // 1. Visitar Produtos e Adicionar o Primeiro Item ao Carrinho
        cy.visit(BASE_URL);
        cy.contains('a', /Products/i).click({ force: true });
        
        // Adicionar o primeiro produto visível
        cy.get('.product-overlay .add-to-cart').first().click({ force: true });

        // 2. Lidar com o Modal "Added!" e Navegar para o Carrinho
        cy.get('#cartModal').should('be.visible').within(() => {
            cy.contains('a', /View Cart/i).click({ force: true });
        });
        
        // 3. Checkout
        cy.url().should('include', '/view_cart');

        // Clicar em "Proceed To Checkout"
        cy.contains('a, button', /Proceed To Checkout/i)
            .should('be.visible')
            .click({ force: true });

        // 4. Cadastrar/Logar: Clicar em "Register / Login"
        cy.contains('a', /Register \/ Login/i)
            .should('be.visible')
            .click({ force: true });

        // 5. Executar o Cadastro Completo (Se cy.fullSignup estiver definido, use aqui)
       // 5. Executar o Cadastro Completo (REPETIÇÃO DO SETUP)
    // Garantimos que estamos na página de Login/Signup
        cy.url().should('include', '/login'); 
        
        // Submetendo o formulário de Signup
        cy.contains('New User Signup!').parent().within(() => {
            cy.get('input[name="name"]').first().type(userData.name, { force: true });
            cy.get('input[name="email"]').first().type(userData.email, { force: true });
            cy.contains('button', /^Signup$/i).first().click({ force: true });
        });

        // 6. Preenche a tela de detalhes da conta (AGORA DEVE PASSAR)
        // Procuramos o container principal que contém a informação de conta
        cy.get('form[action="/signup"]').should('be.visible'); 
        cy.contains('h2', /Enter Account Information/i).should('be.visible');

        cy.get('#id_gender1').check({ force: true });
        cy.get('#password').type(userData.password, { force: true });
        cy.get('#first_name').type(userData.firstName, { force: true });
        cy.get('#id_gender1').check({ force: true });
        cy.get('#password').type(userData.password, { force: true });
        cy.get('#first_name').type(userData.firstName, { force: true });
        cy.get('#last_name').type(userData.lastName, { force: true });
        cy.get('#address1').type('Rua Pedido 1', { force: true });
        cy.get('#country').select('Canada', { force: true });
        cy.get('#state').type('State', { force: true });
        cy.get('#city').type('City', { force: true });
        cy.get('#zipcode').type('99999', { force: true });
        cy.get('#mobile_number').type('+551199999333', { force: true });
        cy.contains('button', /Create Account/i).first().click({ force: true });
        cy.contains('h2', /Account Created!/i, { timeout: 10000 }).should('be.visible');
        cy.contains('a', /Continue/i).first().click({ force: true });
        cy.contains('li a', new RegExp(`Logged in as ${userData.name}`, 'i'), { timeout: 10000 }).should('be.visible');


        // 6. Voltar para o Checkout (O usuário está logado e o carrinho persiste)
        cy.visit(`${BASE_URL}/checkout`);
        cy.url().should('include', '/checkout');
        
        // 7. Clicar em "Place Order" (Colocar Pedido)
        cy.contains('a', /Place Order/i)
            .should('be.visible')
            .click({ force: true });

        // 8. Preencher Detalhes do Pagamento
        // Espera o título da tela de pagamento aparecer
    cy.contains('h2, h3', /Payment|Enter Payment Details/i, { timeout: 10000 }).should('be.visible');

    // SOLUÇÃO: Usamos o seletor ampliado, mas garantimos que pegamos APENAS O PRIMEIRO elemento com .first()
    cy.get('form#payment-form, .payment-information, .checkout-information') 
        .should('be.visible')
        .first() // <--- CORREÇÃO CHAVE: Reduz o subject para um único elemento.
        .within(() => {
        
        // CUIDADO: Se os inputs não tiverem name, use o placeholder.
        cy.get('input[name="name_on_card"], input[placeholder="Name on Card"]').type(cardName, { force: true });
        cy.get('input[name="card_number"], input[placeholder="Card Number"]').type('4242424242424242', { force: true });
        cy.get('input[name="cvc"], input[placeholder="CVC"]').type('123', { force: true });
        cy.get('input[name="expiry_month"], input[placeholder="Expiration (MM)"]').type('12', { force: true });
        cy.get('input[name="expiry_year"], input[placeholder="Expiration (YYYY)"]').type('30', { force: true });
        
        // 9. Clicar em "Pay and Confirm Order"
        cy.contains('button', /Pay and Confirm Order/i)
            .should('be.visible')
            .click({ force: true });
    });
    
    // 10. Assert: Confirmação de pedido
    cy.contains('h2', /Order Placed!/i, { timeout: 30000 }).should('be.visible');
    });
});
