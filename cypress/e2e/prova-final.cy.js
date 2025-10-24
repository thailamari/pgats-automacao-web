// Test Case 1 - Register User
// This spec automates the 'Register User' scenario from https://automationexercise.com/test_cases
// Notes / Assumptions:
// - The test navigates to the Test Cases page and uses the site navigation to reach the signup page.
// - Selectors are based on commonly used attributes on the site (data-qa, id). If the page markup differs,
//   update the selectors accordingly.
// - We use @faker-js/faker (already in devDependencies) to generate a unique name/email.

const { faker } = require('@faker-js/faker');

// Small helpers to reduce repetition and improve readability
const urls = {
	home: 'https://automationexercise.com/',
	login: 'https://automationexercise.com/login',
	products: 'https://automationexercise.com/products',
	contact: 'https://automationexercise.com/contact_us',
	viewCart: 'https://automationexercise.com/view_cart',
	checkout: 'https://automationexercise.com/checkout',
};

function fillAccountDetails({ firstName, lastName, password }) {
	// minimal required fields for account creation used across tests
	cy.get('input#id_gender1, input[name="title"]').first().check().should('be.checked');
	cy.get('input#password, input[name="password"]').first().type(password);
	cy.get('select#days').then(($s) => { if ($s.length) cy.get('select#days').select('1'); });
	cy.get('select#months').then(($s) => { if ($s.length) cy.get('select#months').select('January'); });
	cy.get('select#years').then(($s) => { if ($s.length) cy.get('select#years').select('2000'); });
	cy.get('input#first_name, input[name="first_name"]').first().clear().type(firstName);
	cy.get('input#last_name, input[name="last_name"]').first().clear().type(lastName);
	cy.get('input#company, input[name="company"]').first().clear().type('Company');
	cy.get('input#address1, input[name="address1"]').first().clear().type('Rua Teste 1');
	cy.get('input#address2, input[name="address2"]').first().clear().type('Apto 1');
	cy.get('select#country, select[name="country"]').first().select('Canada').should('exist');
	cy.get('input#state, input[name="state"]').first().clear().type('State');
	cy.get('input#city, input[name="city"]').first().clear().type('City');
	cy.get('input#zipcode, input[name="zipcode"]').first().clear().type('12345');
	cy.get('input#mobile_number, input[name="mobile_number"]').first().clear().type('+551199999000');
}

function doSignup({ fullName, email, firstName, lastName, password }) {
	// Prefer visiting the login page where signup panel is expected
	cy.visit(urls.login);
	cy.contains('New User Signup!').parent().within(() => {
		cy.get('input[name="name"], input[data-qa="signup-name"], input#name').first().clear().type(fullName);
		cy.get('input[name="email"], input[data-qa="signup-email"], input#email').first().clear().type(email);
		cy.contains('button, input', /^Signup$/i).first().click();
	});

	// wait for account information area
	cy.get('body', { timeout: 10000 }).should(($body) => {
		expect(/Enter Account Information|Create Account|ACCOUNT INFORMATION/i.test($body.text())).to.be.true;
	});

	fillAccountDetails({ firstName, lastName, password });

	// create account and continue
	cy.contains('button, a', /Create Account|create account|Create Account!/i).first().click();
	cy.contains(/Account Created!|ACCOUNT CREATED!/i, { timeout: 10000 }).should('be.visible');
	cy.contains(/Continue|continue/i).first().click();
	cy.contains(/Logged in as|Welcome,|My Account/i, { timeout: 10000 }).should('be.visible');
}

describe('Casos de Teste - Automation Exercise (refatorado)', () => {
	beforeEach(() => {
		// perform a light setup for each test
		cy.viewport(1280, 800);
		// small resiliency: ensure home is reachable
		cy.visit(urls.home);
		cy.get('body').should('exist');
	});

	it('Caso de Teste 1 - Registro de Usuário', () => {
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();
		const fullName = `${firstName} ${lastName}`;
		const email = faker.internet.email({ firstName, lastName }).toLowerCase();
		const password = faker.internet.password(8);

		// navigate to test cases page and then to signup flow
		cy.visit(urls.home + 'test_cases');
		cy.url().should('include', '/test_cases');

		// reuse doSignup helper but prefer to navigate via UI when available
		// attempt to click 'Signup / Login' link; fallback to login page
		cy.get('a').contains(/Signup\s*\/\s*Login|Signup\s*\/\s*Login/i).then(($links) => {
			if ($links && $links.length) cy.wrap($links[0]).click();
			else cy.visit(urls.login);
		}).catch(() => cy.visit(urls.login));

		// ensure we are on login/signup
		cy.url().should('match', /login|signup|signin/i);

		doSignup({ fullName, email, firstName, lastName, password });
	});

	it('Caso de Teste 2 - Login de usuário com email e senha corretos', () => {
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();
		const fullName = `${firstName} ${lastName}`;
		const email = faker.internet.email({ firstName, lastName }).toLowerCase();
		const password = faker.internet.password(8);

		// create account then logout and login again
		doSignup({ fullName, email, firstName, lastName, password });
		cy.contains('a', /Logout/i).click();
		cy.contains('Login to your account', { timeout: 10000 }).should('be.visible');

		cy.get('input[data-qa="login-email"], input[name="email"], input#email').first().clear().type(email);
		cy.get('input[data-qa="login-password"], input[name="password"], input#password').first().clear().type(password);
		cy.contains('button, input', /Login/i).first().click();
		cy.contains(/Logged in as|Welcome,|My Account/i, { timeout: 10000 }).should('be.visible');
	});

	it('Caso de Teste 3 - Login de usuário com email e senha incorretos', () => {
		const badEmail = `no_user_${Date.now()}@example.com`;
		const badPassword = 'incorrectPassword123!';

		cy.visit(urls.login);
		cy.contains('Login to your account', { timeout: 10000 }).should('be.visible');
		cy.get('input[data-qa="login-email"], input[name="email"], input#email').first().clear().type(badEmail);
		cy.get('input[data-qa="login-password"], input[name="password"], input#password').first().clear().type(badPassword);
		cy.contains('button, input', /Login/i).first().click();
		cy.contains(/Your email or password is incorrect!|incorrect/i, { timeout: 10000 }).should('be.visible');
	});

	it('Caso de Teste 4 - Logout de usuário', () => {
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();
		const fullName = `${firstName} ${lastName}`;
		const email = faker.internet.email({ firstName, lastName }).toLowerCase();
		const password = faker.internet.password(8);

		doSignup({ fullName, email, firstName, lastName, password });
		cy.contains('a', /Logout/i).click();
		cy.contains('Login to your account', { timeout: 10000 }).should('be.visible');
	});

	it('Caso de Teste 5 - Registrar usuário com email já existente', () => {
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();
		const fullName = `${firstName} ${lastName}`;
		const email = faker.internet.email({ firstName, lastName }).toLowerCase();
		const password = faker.internet.password(8);

		// create first account
		doSignup({ fullName, email, firstName, lastName, password });
		cy.contains('a', /Logout/i).click();
		cy.contains('Login to your account', { timeout: 10000 }).should('be.visible');

		// attempt to register again with same email
		cy.contains('New User Signup!').parent().within(() => {
			cy.get('input[name="name"]').first().clear().type('Another Name');
			cy.get('input[name="email"]').first().clear().type(email);
			cy.contains('button, input', /^Signup$/i).first().click();
		});

		cy.contains(/Email Address already exist!|already exist|email.*exist/i, { timeout: 10000 }).should('be.visible');
	});

	it('Caso de Teste 6 - Formulário de Contato', () => {
		const name = faker.person.fullName();
		const email = faker.internet.email().toLowerCase();
		const subject = 'Dúvida de teste';
		const message = 'Mensagem de teste automatizada via Cypress.';

		cy.visit(urls.contact);
		cy.url().should('include', '/contact_us');
		cy.get('input[name="name"], input[data-qa="name"]').first().clear().type(name);
		cy.get('input[name="email"], input[data-qa="email"]').first().clear().type(email);
		cy.get('input[name="subject"], input[data-qa="subject"]').first().clear().type(subject);
		cy.get('textarea[name="message"], textarea[data-qa="message"]').first().clear().type(message);
		cy.contains('button, input', /Submit|Submit Form|Send/i).first().click();
		cy.contains(/Success!|successfully submitted|Your details have been submitted/i, { timeout: 10000 }).should('be.visible');
	});

	it('Caso de Teste 8 - Verificar todos os produtos e a página de detalhes do produto', () => {
		cy.visit(urls.home);
		cy.contains('a', /Products/i).click();
		cy.url().should('include', '/products');
		cy.contains(/All Products/i).should('be.visible');
		cy.get('.product-image-wrapper, .features_items .col-sm-4, .product, .single-products').its('length').should('be.greaterThan', 0);
		cy.get('.product-image-wrapper, .features_items .col-sm-4, .product, .single-products').first().find('a').first().click();
		cy.get('body', { timeout: 10000 }).should(($body) => {
			expect(/Product Details|product details|Category|Availability|Quantity|Price/i.test($body.text())).to.be.true;
		});
	});

	it('Caso de Teste 9 - Pesquisar Produto', () => {
		cy.visit(urls.home);
		cy.contains('a', /Products/i).click();
		cy.url().should('include', '/products');
		cy.get('input#search_product, input[name="search"], input[placeholder*="Search"], input[type="search"]').first().clear().type('Dress{enter}');
		cy.get('body', { timeout: 10000 }).then(($body) => {
			const productCards = $body.find('.product-image-wrapper, .features_items .col-sm-4, .product, .single-products');
			expect(productCards.length, 'expected at least one product result after search').to.be.greaterThan(0);
		});
	});

	it('Caso de Teste 10 - Verificar Assinatura na página inicial', () => {
		cy.visit(urls.home);
		cy.scrollTo('bottom');
		cy.get('input[id*="susbscribe"], input[id*="subscribe"], input[name*="subscribe"], input[placeholder*="Your email"], input[placeholder*="Email"]').first().then(($input) => {
			if (!$input || !$input.length) throw new Error('Subscription input not found on homepage.');
			const testEmail = `newsletter_${Date.now()}@example.com`;
			cy.wrap($input).clear().type(testEmail);
			cy.wrap($input).parents().first().find('button[type="submit"], input[type="submit"], button, input').first().click();
			cy.get('body', { timeout: 10000 }).should(($body) => {
				const ok = /You have been successfully subscribed|Subscription successful|You are now subscribed|Thank you for subscribing|successfully subscribed|Subscribed/i.test($body.text());
				expect(ok, 'Subscription confirmation not found in page body after submitting email').to.be.true;
			});
		});
	});

	it('Caso de Teste 15 - Fazer Pedido: Cadastrar-se antes de Finalizar a Compra', () => {
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();
		const fullName = `${firstName} ${lastName}`;
		const email = faker.internet.email({ firstName, lastName }).toLowerCase();
		const password = faker.internet.password(10);

		// add first product to cart
		cy.visit(urls.products);
		cy.get('.product-image-wrapper, .features_items .col-sm-4, .product, .single-products').first().then(($p) => {
			const btn = Array.from($p.find('a, button')).find((el) => /add to cart/i.test(el.innerText));
			if (btn) cy.wrap(btn).click();
			else cy.wrap($p).find('a').first().click().then(() => cy.contains(/Add to cart|Add to Cart/i).click());
		});

		// ensure cart/view cart
		cy.contains(/View Cart|Cart/i, { timeout: 8000 }).then(($v) => {
			if ($v && $v.length) cy.wrap($v[0]).click();
			else cy.visit(urls.viewCart);
		}).catch(() => cy.visit(urls.viewCart));

		// proceed to checkout
		cy.contains(/Proceed To Checkout|Proceed to checkout|Checkout/i, { timeout: 8000 }).then(($c) => {
			if ($c && $c.length) cy.wrap($c[0]).click();
			else cy.visit(urls.checkout);
		}).catch(() => cy.visit(urls.checkout));

		// if signup/login required, do signup
		cy.get('body', { timeout: 10000 }).then(($body) => {
			if (/New User Signup!|Register|Sign Up|Signup/i.test($body.text())) {
				doSignup({ fullName, email, firstName, lastName, password });
			}
		});

		// ensure on checkout and try to place the order
		cy.url().then((url) => { if (!/checkout/.test(url)) cy.visit(urls.checkout); });
		cy.get('body', { timeout: 10000 }).then(($b) => {
			if (/Place Order|Pay and Confirm Order|Confirm Order|Place Order!/i.test($b.text())) cy.contains(/Place Order|Pay and Confirm Order|Confirm Order|Place Order!/i).first().click();
		});

		// payment form handling (if present)
		cy.get('body', { timeout: 10000 }).then(($b) => {
			if (/Name on Card|Card Number|CVC|Expiration/i.test($b.text())) {
				cy.get('input[name="name_on_card"], input[placeholder*="Name on Card"]').first().type(`${firstName} ${lastName}`);
				cy.get('input[name="card_number"], input[placeholder*="Card Number"]').first().type('4242424242424242');
				cy.get('input[name="cvc"], input[placeholder*="CVC"]').first().type('123');
				cy.get('input[name="expiry_month"], input[placeholder*="MM"]').first().type('12');
				cy.get('input[name="expiry_year"], input[placeholder*="YY"]').first().type('30');
				cy.contains(/Pay and Confirm Order|Pay Now|Submit/i).first().scrollIntoView().click();
			}
		});

		cy.get('body', { timeout: 30000 }).should(($body) => {
			const ok = /Order Placed!|order placed|Your order has been placed successfully|Order Confirmed|Thank you for your purchase/i.test($body.text());
			expect(ok, 'Order confirmation not found after placing order').to.be.true;
		});
	});
});

