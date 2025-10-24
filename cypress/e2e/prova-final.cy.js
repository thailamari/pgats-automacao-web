const { faker } = require('@faker-js/faker');

describe('Casos de Teste - Automation Exercise', () => {

    
    it('Caso de Teste 1 - Registro de Usuário ', () => {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const fullName = `${firstName} ${lastName}`;
        // Garantindo que o e-mail é único para cada execução
        const email = faker.internet.email({ firstName, lastName, provider: 'automationtest.com' }).toLowerCase();
        const password = faker.internet.password(8);

        // Visitar a página inicial (mais robusto do que ir para /test_cases e depois /login)
        cy.visit('https://automationexercise.com/');
        
        // 1. Navegar para a página de Signup / Login
        cy.contains('a', /Signup \/ Login/i).click({ force: true });
        cy.url().should('match', /login|signup|signin/i);

        // 2. Preencher o formulário de cadastro
        cy.contains('New User Signup!').parent().within(() => {
            cy.get('input[name="name"], input[data-qa="signup-name"]').first().type(fullName, { force: true });
            cy.get('input[name="email"], input[data-qa="signup-email"]').first().type(email, { force: true });
            cy.contains('button, input', /^Signup$/i).first().click({ force: true });
        });

        // 3. Verificar transição para a página de informações da conta
        cy.contains('h2', /Enter Account Information/i, { timeout: 10000 }).should('be.visible');

        // 4. Preencher detalhes da conta (usando o melhor seletor)
        cy.get('#id_gender1').check({ force: true });
        cy.get('#password').type(password, { force: true });
        
        cy.get('#days').select('1');
        cy.get('#months').select('January');
        cy.get('#years').select('2000');
        
        // Newsletter / offers checkboxes (opcional)
        cy.get('input#newsletter').check({ force: true }).should('be.checked');
        cy.get('input#optin').check({ force: true }).should('be.checked');

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

   

    // --- Caso de Teste 2: Login de usuário com email e senha corretos ---
    it('Caso de Teste 2 - Login de usuário com email e senha corretos', () => {
        // Gera dados para o usuário
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const fullName = `${firstName} ${lastName}`;
        const email = faker.internet.email({ firstName, lastName, provider: 'automationtest.com' }).toLowerCase();
        const password = faker.internet.password(8);

        // Usa o Teste 1 para fazer o cadastro inicial e garantir que o usuário existe
        cy.visit('https://automationexercise.com/login');
        
        // 1. Realizar o Cadastro (setup)
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
        cy.url().should('include', '/login');
        
        // 3. Realizar o Login
        cy.contains('h2', 'Login to your account').should('be.visible');
        cy.get('input[data-qa="login-email"]').first().type(email, { force: true });
        cy.get('input[data-qa="login-password"]').first().type(password, { force: true });
        cy.contains('button', /Login/i).first().click({ force: true });

        // 4. Assert: Login bem-sucedido
        cy.contains('li a', new RegExp(`Logged in as ${fullName}`, 'i'), { timeout: 10000 }).should('be.visible');
    });

   

    // --- Caso de Teste 3: Login de usuário com email e senha incorretos ---
    it('Caso de Teste 3 - Login de usuário com email e senha incorretos', () => {
        // 1. Visitar a página de Login
        cy.visit('https://automationexercise.com/login');
        cy.contains('h2', 'Login to your account').should('be.visible');

        // 2. Credenciais incorretas (garante que não existe)
        const badEmail = `no_user_${Date.now()}@example.com`;
        const badPassword = 'incorrectPassword123!';

        // 3. Preencher o formulário
        cy.get('input[data-qa="login-email"]').first().type(badEmail, { force: true });
        cy.get('input[data-qa="login-password"]').first().type(badPassword, { force: true });
        cy.contains('button', /Login/i).first().click({ force: true });

        // 4. Assert: Mensagem de erro visível
        cy.contains('p', /Your email or password is incorrect!/i, { timeout: 10000 }).should('be.visible');
    });

 

    // --- Caso de Teste 4: Logout de usuário (refatorado para usar o setup do Login) ---
    it('Caso de Teste 4 - Logout de usuário', () => {
        // 1. Fazer o setup: Cadastrar e logar (código simplificado para reaproveitamento)
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const fullName = `${firstName} ${lastName}`;
        const email = faker.internet.email({ firstName, lastName, provider: 'autologout.com' }).toLowerCase();
        const password = faker.internet.password(8);

        cy.visit('https://automationexercise.com/login');
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
        cy.contains('li a', new RegExp(`Logged in as ${fullName}`, 'i'), { timeout: 10000 }).should('be.visible'); // Assegura que está logado

        // 2. Fazer Logout
        cy.contains('a', /Logout/i).click({ force: true });

        // 3. Assert: Verificar que a URL é de login e o painel de login/signup está visível
        cy.url().should('include', '/login');
        cy.contains('h2', 'Login to your account').should('be.visible');
    });

  

    // --- Caso de Teste 5: Registrar usuário com email já existente ---
    it('Caso de Teste 5 - Registrar usuário com email já existente', () => {
        // 1. Fazer o setup: Cadastrar um usuário (para que o email exista)
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const fullName = `${firstName} ${lastName}`;
        const existingEmail = faker.internet.email({ firstName, lastName, provider: 'autofail.com' }).toLowerCase();
        const password = faker.internet.password(8);

        cy.visit('https://automationexercise.com/login');
        
        // Primeiro Cadastro (para gerar o email existente)
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
        cy.visit('https://automationexercise.com/login');
        cy.contains('New User Signup!').parent().within(() => {
            cy.get('input[name="name"]').first().type('Another Name', { force: true });
            cy.get('input[name="email"]').first().type(existingEmail, { force: true });
            cy.contains('button', /^Signup$/i).first().click({ force: true });
        });
        
        // 3. Assert: Mensagem de erro visível
        cy.contains('p', /Email Address already exist!/i, { timeout: 10000 }).should('be.visible');
    });


    // --- Caso de Teste 6: Formulário de Contato ---
    it('Caso de Teste 6 - Formulário de Contato', () => {
        const name = faker.person.fullName();
        const email = faker.internet.email().toLowerCase();
        const subject = 'Dúvida de teste';
        const message = 'Mensagem de teste automatizada via Cypress.';

        // 1. Navegar para a página de contato
        cy.visit('https://automationexercise.com/');
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
        
        // 4. Lidar com o alerta de confirmação (se o site tiver) - se não houver alerta, a próxima asserção deve funcionar
        cy.on('window:confirm', (str) => {
            expect(str).to.equal('Press OK to proceed!'); // Verifica a mensagem
            return true; // Clica em OK
        });

        // 5. Assert: Mensagem de sucesso
        cy.contains('.status', /Success! Your details have been submitted successfully/i, { timeout: 10000 }).should('be.visible');
    });

   

    // --- Caso de Teste 8: Verificar todos os produtos e detalhes ---
    it('Caso de Teste 8 - Verificar todos os produtos e a página de detalhes do produto ', () => {
        // 1. Navegar para a página de Produtos
        cy.visit('https://automationexercise.com/');
        cy.contains('a', /Products/i).click({ force: true });
        cy.url().should('include', '/products');
        cy.contains('h2', /All Products/i).should('be.visible');

        // 2. Verificar se há produtos listados
        cy.get('.product-image-wrapper', { timeout: 10000 }).should('have.length.greaterThan', 0).then(($els) => {
            // 3. Clicar no primeiro link de detalhes do primeiro produto
            cy.wrap($els).first().contains('a', /View Product/i).click({ force: true });
        });

        // 4. Assert: Verificar detalhes do produto (nome, categoria, preço, etc.)
        cy.url().should('match', /\/product_details\/\d+/i);
        cy.get('.product-information').within(() => {
            cy.get('h2').should('be.visible'); // Nome do produto
            cy.contains(/Category|Availability|Condition|Brand/i).should('be.visible'); // Detalhes principais
            cy.get('span').contains('Rs.').should('be.visible'); // Preço
        });
    });

  

    // --- Caso de Teste 9: Pesquisar Produto ---
    it('Caso de Teste 9 - Pesquisar Produto', () => {
    const searchTerm = 'Dress';
    
    // 1. Visitar a página inicial
    cy.visit('https://automationexercise.com/');

    // 2. Navegar para a página de Produtos
    // Usa o comando customizado 'navigateTo' ou cy.contains direto
    cy.contains('a', /Products/i).click({ force: true });
    cy.url().should('include', '/products');

    // 3. Preencher e enviar o formulário de pesquisa
    // Usa seletor data-qa ou o ID (que é mais estável aqui: #search_product)
    cy.get('input#search_product')
        .should('be.visible')
        .type(searchTerm);
    
    // O botão de busca geralmente tem o ID #submit_search
    cy.get('#submit_search').click({ force: true });

    // 4. Assert: Verificar o cabeçalho de resultados
    cy.contains('h2', /Searched Products/i)
        .should('be.visible');

    // 5. Assert: Verificar se há resultados E se o termo de busca está presente.
    // O seletor '.product-image-wrapper' é usado para os cards individuais.
    // '.features_items' é o container de toda a lista de resultados.
    
    // Garante que pelo menos um card de produto foi encontrado
    cy.get('.product-image-wrapper').should('have.length.greaterThan', 0);
    
    // Verifica se o container de resultados contém a palavra 'Dress', validando a busca.
    cy.get('.features_items')
        .should('include.text', searchTerm);
});

   

    // --- Caso de Teste 10: Verificar Assinatura na página inicial ---
    it('Caso de Teste 10 - Verificar Assinatura na página inicial', () => {
        const testEmail = `newsletter_${Date.now()}@example.com`;

        // 1. Visitar a página inicial e rolar para o rodapé
        cy.visit('https://automationexercise.com/');
        cy.url().should('match', /automationexercise\.com\/?$/i);
        cy.scrollTo('bottom');

        // 2. Preencher o campo de e-mail da assinatura
        cy.get('#susbscribe_email, input[placeholder*="email"]').scrollIntoView().should('be.visible')
            .clear({ force: true })
            .type(testEmail, { force: true });

        // 3. Clicar no botão de subscrição
        cy.get('#subscribe, button[type="submit"]').first().click({ force: true });

        // 4. Assert: Mensagem de sucesso
        cy.contains('.alert-success, .status', /You have been successfully subscribed!/i, { timeout: 10000 }).should('be.visible');
    });

  

    // --- Caso de Teste 15: Fazer Pedido: Cadastrar-se antes de Finalizar a Compra ---
    it('Caso de Teste 15 - Fazer Pedido: Cadastrar-se antes de Finalizar a Compra ', () => {
        // Este trecho deve estar no seu arquivo .cy.js, dentro do bloco describe.
// O comando cy.fullSignup(userData) e a função generateUserData devem estar disponíveis.

    it('Caso de Teste 15 - Fazer Pedido: Cadastrar-se antes de Finalizar a Compra', () => {
        // Gera dados únicos para o usuário (usando a função de helper)
        const userData = generateUserData('checkout.com');
        const cardName = `${userData.firstName} ${userData.lastName}`;

        // 1. Visitar Produtos e Adicionar o Primeiro Item ao Carrinho
        cy.visit(BASE_URL);
        cy.contains('a', /Products/i).click({ force: true });
        
        // Adicionar o primeiro produto visível
        cy.get('.product-overlay .add-to-cart').first().click({ force: true });

        // 2. Lidar com o Modal "Added!" e Navegar para o Carrinho
        // Espera o modal de confirmação do produto aparecer e clica em "View Cart"
        cy.get('#cartModal').should('be.visible').within(() => {
            cy.contains('a', /View Cart/i).click({ force: true });
        });
        
        // 3. Checkout
        cy.url().should('include', '/view_cart');

        // Clicar em "Proceed To Checkout" (Solução robusta que resolveu os timeouts)
        cy.contains('a, button', /Proceed To Checkout/i)
            .should('be.visible')
            .click({ force: true });

        // 4. Cadastrar/Logar: Clicar em "Register / Login"
        cy.contains('a', /Register \/ Login/i)
            .should('be.visible')
            .click({ force: true });

        // 5. Executar o Cadastro Completo (Comando Customizado)
        // Este comando navega e cadastra o usuário, garantindo que ele está logado no final.
        cy.fullSignup(userData);

        // 6. Voltar para o Checkout (O usuário está logado e o carrinho persiste)
        cy.visit(`${BASE_URL}/checkout`);
        cy.url().should('include', '/checkout');
        
        // 7. Clicar em "Place Order" (Colocar Pedido)
        cy.contains('a', /Place Order/i)
            .should('be.visible')
            .click({ force: true });

        // 8. Preencher Detalhes do Pagamento (Esperando o formulário carregar)
        cy.get('.payment-form').should('be.visible').within(() => {
            cy.get('input[name="name_on_card"]').type(cardName, { force: true });
            cy.get('input[name="card_number"]').type('4242424242424242', { force: true });
            cy.get('input[name="cvc"]').type('123', { force: true });
            cy.get('input[name="expiry_month"]').type('12', { force: true });
            cy.get('input[name="expiry_year"]').type('30', { force: true });
            
            // 9. Clicar em "Pay and Confirm Order"
            cy.contains('button', /Pay and Confirm Order/i)
                .should('be.visible')
                .click({ force: true });
        });
        
        // 10. Assert: Confirmação de pedido
        cy.contains('h2', /Order Placed!/i, { timeout: 30000 }).should('be.visible');
    });
    });
});