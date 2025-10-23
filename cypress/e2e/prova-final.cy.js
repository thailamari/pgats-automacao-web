// Test Case 1 - Register User
// This spec automates the 'Register User' scenario from https://automationexercise.com/test_cases
// Notes / Assumptions:
// - The test navigates to the Test Cases page and uses the site navigation to reach the signup page.
// - Selectors are based on commonly used attributes on the site (data-qa, id). If the page markup differs,
//   update the selectors accordingly.
// - We use @faker-js/faker (already in devDependencies) to generate a unique name/email.

const { faker } = require('@faker-js/faker');

describe('Casos de Teste - Automation Exercise', () => {
	it('Caso de Teste 1 - Registro de Usuário ', () => {
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();
		const fullName = `${firstName} ${lastName}`;
		const email = faker.internet.email({ firstName, lastName }).toLowerCase();
		const password = faker.internet.password(8);

		// Visit Test Cases page
		cy.visit('https://automationexercise.com/test_cases');
		cy.url().should('include', '/test_cases');

				// Navigate to the Signup / Login page. Check body for a matching link; if not found, visit the login URL directly.
				cy.get('body').then(($body) => {
					// find an anchor whose text matches 'Signup / Login' (case-insensitive)
					const signupAnchor = $body
						.find('a')
						.filter((i, el) => /Signup\s*\/\s*Login/i.test(el.innerText))
						.first();

					if (signupAnchor && signupAnchor.length) {
						cy.wrap(signupAnchor).click({ force: true });
					} else {
						// fallback: visit login/signup directly
						cy.visit('https://automationexercise.com/login');
					}
				});

		// Ensure we're on the signup/login page
		cy.url().should('match', /login|signup|signin/i);

				// Fill the signup form inside the 'New User Signup!' panel to avoid interacting with the login form.
				cy.contains('New User Signup!').parent().within(() => {
					cy.get('input[name="name"], input[data-qa="signup-name"], input#name').first().type(fullName, { force: true });
					cy.get('input[name="email"], input[data-qa="signup-email"], input#email').first().type(email, { force: true });
					// Click the Signup button inside this panel
					cy.contains('button, input', /^Signup$/i).first().click({ force: true });
				});

			// Wait/check for the account information section by inspecting the page body text (regex).
			// This is more robust than relying on a single heading element.
				cy.get('body', { timeout: 10000 }).should(($body) => {
					const text = $body.text();
					const matched = /Enter Account Information|Create Account|ACCOUNT INFORMATION/i.test(text);
					const snippet = text ? text.slice(0, 1200) : '[no body text]';
					// Use Cypress/Chai assertion so failures are reported cleanly
					expect(matched, 'Account information section not found after signup. Page text snapshot:\n' + snippet).to.be.true;
				});

		// Fill account details. Use common ids/names where available; update if site differs.
		// Title / gender
		cy.get('input#id_gender1, input[name="title"]').first().check({ force: true }).should('be.checked');
		// Password
		cy.get('input#password, input[name="password"]').first().type(password, { force: true });
		// Date of birth selects (if present)
		cy.get('select#days').then(($s) => { if ($s.length) cy.get('select#days').select('1'); });
		cy.get('select#months').then(($s) => { if ($s.length) cy.get('select#months').select('January'); });
		cy.get('select#years').then(($s) => { if ($s.length) cy.get('select#years').select('2000'); });
		// Newsletter / offers checkboxes (optional)
		cy.get('input#newsletter, input[name="newsletter"]').then(($c) => { if ($c.length) cy.wrap($c).check({ force: true }); });
		cy.get('input#optin, input[name="optin"]').then(($c) => { if ($c.length) cy.wrap($c).check({ force: true }); });

		// Name and address fields
		cy.get('input#first_name, input[name="first_name"]').first().type(firstName, { force: true });
		cy.get('input#last_name, input[name="last_name"]').first().type(lastName, { force: true });
		cy.get('input#company, input[name="company"]').first().type('Company', { force: true });
		cy.get('input#address1, input[name="address1"]').first().type('Rua Exemplo 123', { force: true });
		cy.get('input#address2, input[name="address2"]').first().type('Apto 1', { force: true });
		cy.get('select#country, select[name="country"]').first().select('Canada', { force: true }).should('exist').then(() => {});
		cy.get('input#state, input[name="state"]').first().type('State', { force: true });
		cy.get('input#city, input[name="city"]').first().type('City', { force: true });
		cy.get('input#zipcode, input[name="zipcode"]').first().type('12345', { force: true });
		cy.get('input#mobile_number, input[name="mobile_number"]').first().type('+5511999999999', { force: true });

		// Submit create account - look for common button text
		cy.contains('button, a', /Create Account|create account|Create Account!/i).first().click({ force: true });

		// Assert success message
		cy.contains(/Account Created!|ACCOUNT CREATED!/i, { timeout: 10000 }).should('be.visible');

		// Optionally click continue and assert user is logged in
		cy.contains(/Continue|continue/i).first().click({ force: true });
		cy.contains(/Logged in as|Welcome,|My Account/i, { timeout: 10000 }).should('be.visible');
	});

    it('Caso de Teste 2 - Login de usuário com email e senha corretos', () => {
		// We'll create a new user, then logout and login with the same credentials.
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();
		const fullName = `${firstName} ${lastName}`;
		const email = faker.internet.email({ firstName, lastName }).toLowerCase();
		const password = faker.internet.password(8);

		// Helper: perform signup flow (reuse the existing steps)
		const signup = () => {
			cy.visit('https://automationexercise.com/login');
			// Fill signup panel
			cy.contains('New User Signup!').parent().within(() => {
				cy.get('input[name="name"], input[data-qa="signup-name"], input#name').first().type(fullName, { force: true });
				cy.get('input[name="email"], input[data-qa="signup-email"], input#email').first().type(email, { force: true });
				cy.contains('button, input', /^Signup$/i).first().click({ force: true });
			});

			// Wait until account info appears
			cy.get('body', { timeout: 10000 }).should(($body) => {
				const text = $body.text();
				const matched = /Enter Account Information|Create Account|ACCOUNT INFORMATION/i.test(text);
				expect(matched, 'Account information section not found after signup').to.be.true;
			});

			// Fill required account details quickly
			cy.get('input#id_gender1, input[name="title"]').first().check({ force: true }).should('be.checked');
			cy.get('input#password, input[name="password"]').first().type(password, { force: true });
			cy.get('select#days').then(($s) => { if ($s.length) cy.get('select#days').select('1'); });
			cy.get('select#months').then(($s) => { if ($s.length) cy.get('select#months').select('January'); });
			cy.get('select#years').then(($s) => { if ($s.length) cy.get('select#years').select('2000'); });
			cy.get('input#first_name, input[name="first_name"]').first().type(firstName, { force: true });
			cy.get('input#last_name, input[name="last_name"]').first().type(lastName, { force: true });
			cy.get('input#company, input[name="company"]').first().type('Company', { force: true });
			cy.get('input#address1, input[name="address1"]').first().type('Rua Teste 1', { force: true });
			cy.get('input#address2, input[name="address2"]').first().type('Apto 1', { force: true });
			cy.get('select#country, select[name="country"]').first().select('Canada', { force: true }).should('exist');
			cy.get('input#state, input[name="state"]').first().type('State', { force: true });
			cy.get('input#city, input[name="city"]').first().type('City', { force: true });
			cy.get('input#zipcode, input[name="zipcode"]').first().type('12345', { force: true });
			cy.get('input#mobile_number, input[name="mobile_number"]').first().type('+551199999000', { force: true });

			cy.contains('button, a', /Create Account|create account|Create Account!/i).first().click({ force: true });
			cy.contains(/Account Created!|ACCOUNT CREATED!/i, { timeout: 10000 }).should('be.visible');
			cy.contains(/Continue|continue/i).first().click({ force: true });
			cy.contains(/Logged in as|Welcome,|My Account/i, { timeout: 10000 }).should('be.visible');
		};

		// Signup the user
		signup();

		// Logout action - find logout link and click
		cy.contains('a', /Logout/i).click({ force: true });

		// Ensure we're logged out (login panel visible)
		cy.contains('Login to your account', { timeout: 10000 }).should('be.visible');

		// Now login with correct credentials
		cy.get('input[data-qa="login-email"], input[name="email"], input#email').first().type(email, { force: true });
		cy.get('input[data-qa="login-password"], input[name="password"], input#password').first().type(password, { force: true });
		cy.contains('button, input', /Login/i).first().click({ force: true });

		// Assert successful login
		cy.contains(/Logged in as|Welcome,|My Account/i, { timeout: 10000 }).should('be.visible');

    });

    it('Caso de Teste 3 - Login de usuário com email e senha incorretos', () => {
	// Use a random/invalid email and password
	const badEmail = `no_user_${Date.now()}@example.com`;
	const badPassword = 'incorrectPassword123!';

	// Go to login page
	cy.visit('https://automationexercise.com/login');
	cy.contains('Login to your account', { timeout: 10000 }).should('be.visible');

	// Fill login form with incorrect credentials
	cy.get('input[data-qa="login-email"], input[name="email"], input#email').first().type(badEmail, { force: true });
	cy.get('input[data-qa="login-password"], input[name="password"], input#password').first().type(badPassword, { force: true });
	cy.contains('button, input', /Login/i).first().click({ force: true });

	// Assert error message shown
	cy.contains(/Your email or password is incorrect!|incorrect/i, { timeout: 10000 }).should('be.visible');

    });

    it('Caso de Teste 4 - Logout de usuário', () => {
		// Create and login a user, then logout and assert logout succeeded
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();
		const fullName = `${firstName} ${lastName}`;
		const email = faker.internet.email({ firstName, lastName }).toLowerCase();
		const password = faker.internet.password(8);

		// Signup (reuse steps from earlier tests)
		cy.visit('https://automationexercise.com/login');
		cy.contains('New User Signup!').parent().within(() => {
			cy.get('input[name="name"], input[data-qa="signup-name"], input#name').first().type(fullName, { force: true });
			cy.get('input[name="email"], input[data-qa="signup-email"], input#email').first().type(email, { force: true });
			cy.contains('button, input', /^Signup$/i).first().click({ force: true });
		});

		cy.get('body', { timeout: 10000 }).should(($body) => {
			const text = $body.text();
			const matched = /Enter Account Information|Create Account|ACCOUNT INFORMATION/i.test(text);
			expect(matched, 'Account information not present after signup').to.be.true;
		});

		// Fill required fields then create account (match Test Case 1/2 fields)
		cy.get('input#id_gender1, input[name="title"]').first().check({ force: true }).should('be.checked');
		cy.get('input#password, input[name="password"]').first().type(password, { force: true });
		cy.get('select#days').then(($s) => { if ($s.length) cy.get('select#days').select('1'); });
		cy.get('select#months').then(($s) => { if ($s.length) cy.get('select#months').select('January'); });
		cy.get('select#years').then(($s) => { if ($s.length) cy.get('select#years').select('2000'); });
		cy.get('input#first_name, input[name="first_name"]').first().type(firstName, { force: true });
		cy.get('input#last_name, input[name="last_name"]').first().type(lastName, { force: true });
		cy.get('input#company, input[name="company"]').first().type('Company', { force: true });
		cy.get('input#address1, input[name="address1"]').first().type('Rua Logout 1', { force: true });
		cy.get('input#address2, input[name="address2"]').first().type('Apto 1', { force: true });
		cy.get('select#country, select[name="country"]').first().select('Canada', { force: true }).should('exist');
		cy.get('input#state, input[name="state"]').first().type('State', { force: true });
		cy.get('input#city, input[name="city"]').first().type('City', { force: true });
		cy.get('input#zipcode, input[name="zipcode"]').first().type('12345', { force: true });
		cy.get('input#mobile_number, input[name="mobile_number"]').first().type('+551199999111', { force: true });
		cy.contains('button, a', /Create Account|create account|Create Account!/i).first().click({ force: true });
		cy.contains(/Account Created!|ACCOUNT CREATED!/i, { timeout: 10000 }).should('be.visible');
		cy.contains(/Continue|continue/i).first().click({ force: true });
		cy.contains(/Logged in as|Welcome,|My Account/i, { timeout: 10000 }).should('be.visible');

		// Now logout
		cy.contains('a', /Logout/i).click({ force: true });

		// Assert we are logged out: login panel visible
		cy.contains('Login to your account', { timeout: 10000 }).should('be.visible');

    });

    it('Caso de Teste 5 - Registrar usuário com email já existente', () => {
		// Create a user then attempt to register again with the same email
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();
		const fullName = `${firstName} ${lastName}`;
		const email = faker.internet.email({ firstName, lastName }).toLowerCase();
		const password = faker.internet.password(8);

		// Signup the first time
		cy.visit('https://automationexercise.com/login');
		cy.contains('New User Signup!').parent().within(() => {
			cy.get('input[name="name"]').first().type(fullName, { force: true });
			cy.get('input[name="email"]').first().type(email, { force: true });
			cy.contains('button, input', /^Signup$/i).first().click({ force: true });
		});

	// Fill full account info (match other tests)
	cy.get('input#id_gender1, input[name="title"]').first().check({ force: true }).should('be.checked');
	cy.get('input#password, input[name="password"]').first().type(password, { force: true });
	cy.get('select#days').then(($s) => { if ($s.length) cy.get('select#days').select('1'); });
	cy.get('select#months').then(($s) => { if ($s.length) cy.get('select#months').select('January'); });
	cy.get('select#years').then(($s) => { if ($s.length) cy.get('select#years').select('2000'); });
	cy.get('input#first_name, input[name="first_name"]').first().type(firstName, { force: true });
	cy.get('input#last_name, input[name="last_name"]').first().type(lastName, { force: true });
	cy.get('input#company, input[name="company"]').first().type('Company', { force: true });
	cy.get('input#address1, input[name="address1"]').first().type('Rua Existente 1', { force: true });
	cy.get('input#address2, input[name="address2"]').first().type('Apto 2', { force: true });
	cy.get('select#country, select[name="country"]').first().select('Canada', { force: true }).should('exist');
	cy.get('input#state, input[name="state"]').first().type('State', { force: true });
	cy.get('input#city, input[name="city"]').first().type('City', { force: true });
	cy.get('input#zipcode, input[name="zipcode"]').first().type('54321', { force: true });
	cy.get('input#mobile_number, input[name="mobile_number"]').first().type('+551199999222', { force: true });
	cy.contains('button, a', /Create Account|create account|Create Account!/i).first().click({ force: true });
		cy.contains(/Account Created!|ACCOUNT CREATED!/i, { timeout: 10000 }).should('be.visible');
		cy.contains(/Continue|continue/i).first().click({ force: true });
		cy.contains(/Logged in as|Welcome,|My Account/i, { timeout: 10000 }).should('be.visible');

		// Logout
		cy.contains('a', /Logout/i).click({ force: true });
		cy.contains('Login to your account', { timeout: 10000 }).should('be.visible');

		// Attempt to register again with same email
		cy.contains('New User Signup!').parent().within(() => {
			cy.get('input[name="name"]').first().type('Another Name', { force: true });
			cy.get('input[name="email"]').first().type(email, { force: true });
			cy.contains('button, input', /^Signup$/i).first().click({ force: true });
		});

		// Expect an error message about existing email (site shows 'Email Address already exist!')
		cy.contains(/Email Address already exist!|already exist|email.*exist/i, { timeout: 10000 }).should('be.visible');

    });

    it('Caso de Teste 6 - Formulário de Contato', () => {
	const name = faker.person.fullName();
	const email = faker.internet.email().toLowerCase();
	const subject = 'Dúvida de teste';
	const message = 'Mensagem de teste automatizada via Cypress.';

	// Visit Contact us page
	cy.visit('https://automationexercise.com/contact_us');
	cy.url().should('include', '/contact_us');

	// Fill the contact form - selectors vary; use common ones
	cy.get('input[name="name"], input[data-qa="name"]').first().type(name, { force: true });
	cy.get('input[name="email"], input[data-qa="email"]').first().type(email, { force: true });
	cy.get('input[name="subject"], input[data-qa="subject"]').first().type(subject, { force: true });
	cy.get('textarea[name="message"], textarea[data-qa="message"]').first().type(message, { force: true });

	// Submit form
	cy.contains('button, input', /Submit|Submit Form|Send/i).first().click({ force: true });

	// Assert success message - site typically shows 'Success! Your details have been submitted successfully.'
	cy.contains(/Success!|successfully submitted|Your details have been submitted/i, { timeout: 10000 }).should('be.visible');

    });

    it('Caso de Teste 8 - Verificar todos os produtos e a página de detalhes do produto ', () => {
		// Navigate to Products page
		cy.visit('https://automationexercise.com/');
		cy.contains('a', /Products/i).click({ force: true });
		cy.url().should('include', '/products');

		// Assert All Products heading present
		cy.contains(/All Products/i).should('be.visible');

		// Ensure at least one product is listed
		cy.get('.product-image-wrapper, .features_items .col-sm-4, .product, .single-products').then(($els) => {
			expect($els.length, 'expected at least one product on Products page').to.be.greaterThan(0);

			// Click the first product's first link (robust to markup)
			cy.wrap($els[0]).find('a').first().click({ force: true });

			// On product detail page assert product information is visible
			cy.get('body', { timeout: 10000 }).should(($body) => {
				const text = $body.text();
				const matched = /Product Details|product details|Category|Availability|Quantity|Price/i.test(text);
				expect(matched, 'expected product detail content to be visible').to.be.true;
			});
		});
    });

    it('Caso de Teste 9 - Pesquisar Produto', () => {
		// Navigate to Products page
		cy.visit('https://automationexercise.com/');
		cy.contains('a', /Products/i).click({ force: true });
		cy.url().should('include', '/products');

		// Use the search field if present
		cy.get('input#search_product, input[name="search"], input[placeholder*="Search"], input[type="search"]')
			.first()
			.clear()
			.type('Dress', { force: true })
			.type('{enter}', { force: true });

		// Validate results: either a 'Searched Products' header appears, or at least one product card is visible.
		cy.get('body', { timeout: 10000 }).then(($body) => {
			const text = $body.text();
			const hasHeader = /Searched Products|SEARCHED PRODUCTS|Search Results/i.test(text);
			const productCards = $body.find('.product-image-wrapper, .features_items .col-sm-4, .product, .single-products');

			if (hasHeader) {
				cy.contains(/Searched Products|SEARCHED PRODUCTS|Search Results/i).should('be.visible');
			}

			// Always assert that product cards exist as the primary success signal
			expect(productCards.length, 'expected at least one product result after search').to.be.greaterThan(0);
		});

    });

	it('Caso de Teste 10 - Verificar Assinatura na página inicial', () => {
		// Visit home page
		cy.visit('https://automationexercise.com/');
		cy.url().should('match', /automationexercise\.com\/?$/i);

		// Scroll to bottom where the subscription input is commonly located
		cy.scrollTo('bottom');

		// Look for subscription input and submit - be permissive with selectors
		cy.get('input[id*="susbscribe"], input[id*="subscribe"], input[name*="subscribe"], input[placeholder*="Your email"], input[placeholder*="Email"]')
			.first()
			.then(($input) => {
				if (!$input || !$input.length) {
					// If no subscription input found, fail with helpful message
					throw new Error('Subscription input not found on homepage.');
				}
				const testEmail = `newsletter_${Date.now()}@example.com`;
				cy.wrap($input).clear({ force: true }).type(testEmail, { force: true });

				// Try to find a nearby button to submit the subscription
				const submitCandidates = ['button[id*="subscribe"]', 'button[class*="subscribe"]', 'button[type="submit"]', 'input[type="submit"]', 'button, input'];
				let clicked = false;
				// Attempt clicking first visible candidate near the input
				cy.wrap($input).parents().first().find(submitCandidates.join(', ')).then(($btns) => {
					if ($btns.length) {
						cy.wrap($btns[0]).click({ force: true });
						clicked = true;
					}
				}).then(() => {
					// If not clicked yet, try a global subscribe button
					if (!clicked) {
						cy.get(submitCandidates.join(', ')).then(($allBtns) => {
							if ($allBtns.length) cy.wrap($allBtns[0]).click({ force: true });
						});
					}
				});

				// Assert success message or confirmation appears
				cy.get('body', { timeout: 10000 }).should(($body) => {
					const text = $body.text();
					const ok = /You have been successfully subscribed|Subscription successful|You are now subscribed|Thank you for subscribing|successfully subscribed|Subscribed/i.test(text);
					expect(ok, 'Subscription confirmation not found in page body after submitting email').to.be.true;
				});
			});
	});

	it('Caso de Teste 15 - Fazer Pedido: Cadastrar-se antes de Finalizar a Compra ', () => {
		// Improved robustness: handle variations in how the site exposes cart/checkout buttons
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();
		const fullName = `${firstName} ${lastName}`;
		const email = faker.internet.email({ firstName, lastName }).toLowerCase();
		const password = faker.internet.password(10);

		// 1) Visit products
		cy.visit('https://automationexercise.com/');
		cy.contains('a', /Products/i, { timeout: 10000 }).click({ force: true });
		cy.url().should('include', '/products');

		// 2) Add first product to cart (robust search for add button)
		cy.get('.product-image-wrapper, .features_items .col-sm-4, .product, .single-products', { timeout: 10000 })
			.first()
			.then(($p) => {
				// try to find a visible Add to cart button inside the product element
				const btn = Array.from($p.find('a, button')).find((el) => /add to cart/i.test(el.innerText));
				if (btn) {
					cy.wrap(btn).click({ force: true });
				} else {
					// fallback: open product detail and click a global 'Add to cart'
					cy.wrap($p).find('a').first().click({ force: true });
					cy.contains(/Add to cart|Add to Cart/i, { timeout: 5000 }).click({ force: true });
				}
			});

		// 2a) Handle modal/notification that confirms addition to cart (if any)
		cy.get('body', { timeout: 8000 }).then(($b) => {
			// if there's a modal with view-cart link/button, click it
			const modalView = $b.find('a:contains("View Cart"), a[href*="view_cart"], button:contains("View Cart")');
			if (modalView && modalView.length) {
				cy.wrap(modalView[0]).click({ force: true });
				return;
			}
		});

		// 3) Attempt to open the cart page using common links; if not found, visit the URL directly
		cy.get('body', { timeout: 8000 }).then(($b) => {
			const viewLink = $b.find('a[href*="/view_cart"]');
			if (viewLink && viewLink.length) {
				cy.wrap(viewLink[0]).click({ force: true });
			} else {
				const generic = $b.find('a').filter((i, el) => /View Cart|Cart/i.test(el.innerText)).first();
				if (generic && generic.length) cy.wrap(generic).click({ force: true });
				else cy.visit('https://automationexercise.com/view_cart');
			}
		});

		// 4) Proceed to checkout - try to click textual button, otherwise navigate to checkout directly
		cy.get('body', { timeout: 8000 }).then(($b) => {
			if (/Proceed To Checkout|Proceed to checkout|Checkout/i.test($b.text())) {
				cy.contains(/Proceed To Checkout|Proceed to checkout|Checkout/i).first().click({ force: true });
			} else {
				// fallback to direct checkout url
				cy.visit('https://automationexercise.com/checkout');
			}
		});

		// 5) If the checkout flow requires registration/login, handle modal case first
		// If a modal is shown with a 'Register / Login' link, click it to open the login/signup page.
		cy.get('body', { timeout: 5000 }).then(($bodyModal) => {
			const modalLink = Array.from($bodyModal.find('a')).find((el) => /Register\s*\/\s*Login|Register\s*\/\s*Login/i.test(el.innerText));
			if (modalLink) {
				cy.wrap(modalLink).click({ force: true });
			}
		});

		// Now attempt to detect an inline signup/login area and perform signup if needed
		cy.get('body', { timeout: 10000 }).then(($body) => {
			const needSignup = /New User Signup!|Register|Sign Up|Signup/i.test($body.text());
			if (needSignup) {
				// Prefer the 'New User Signup!' panel when available
				if ($body.find(':contains("New User Signup!")').length) {
					cy.contains('New User Signup!').parent().within(() => {
						cy.get('input[name="name"], input[data-qa="signup-name"], input#name').first().type(fullName, { force: true });
						cy.get('input[name="email"], input[data-qa="signup-email"], input#email').first().type(email, { force: true });
						cy.contains('button, input', /^Signup$/i).first().click({ force: true });
					});
				} else {
					// fallback to visiting the login page where signup panel exists
					cy.visit('https://automationexercise.com/login');
					cy.contains('New User Signup!', { timeout: 10000 }).should('be.visible');
					cy.contains('New User Signup!').parent().within(() => {
						cy.get('input[name="name"], input[data-qa="signup-name"], input#name').first().type(fullName, { force: true });
						cy.get('input[name="email"], input[data-qa="signup-email"], input#email').first().type(email, { force: true });
						cy.contains('button, input', /^Signup$/i).first().click({ force: true });
					});
				}

				cy.get('body', { timeout: 10000 }).should(($b2) => {
					expect(/Enter Account Information|Create Account|ACCOUNT INFORMATION/i.test($b2.text())).to.be.true;
				});

				// fill account details
				cy.get('input#id_gender1, input[name="title"]').first().check({ force: true });
				cy.get('input#password, input[name="password"]').first().type(password, { force: true });
				cy.get('select#days').then(($s) => { if ($s.length) cy.get('select#days').select('1'); });
				cy.get('select#months').then(($s) => { if ($s.length) cy.get('select#months').select('January'); });
				cy.get('select#years').then(($s) => { if ($s.length) cy.get('select#years').select('2000'); });
				cy.get('input#first_name, input[name="first_name"]').first().type(firstName, { force: true });
				cy.get('input#last_name, input[name="last_name"]').first().type(lastName, { force: true });
				cy.get('input#company, input[name="company"]').first().type('Company', { force: true });
				cy.get('input#address1, input[name="address1"]').first().type('Rua Pedido 1', { force: true });
				cy.get('input#address2, input[name="address2"]').first().type('Apto 1', { force: true });
				cy.get('select#country, select[name="country"]').first().select('Canada', { force: true }).should('exist');
				cy.get('input#state, input[name="state"]').first().type('State', { force: true });
				cy.get('input#city, input[name="city"]').first().type('City', { force: true });
				cy.get('input#zipcode, input[name="zipcode"]').first().type('99999', { force: true });
				cy.get('input#mobile_number, input[name="mobile_number"]').first().type('+551199999333', { force: true });

				cy.contains('button, a', /Create Account|create account|Create Account!/i).first().click({ force: true });
				cy.contains(/Account Created!|ACCOUNT CREATED!/i, { timeout: 10000 }).should('be.visible');
				cy.contains(/Continue|continue/i).first().click({ force: true });
				cy.contains(/Logged in as|Welcome,|My Account/i, { timeout: 10000 }).should('be.visible');
			}
		});

		// 6) Ensure we are on checkout page; if needed navigate
		cy.url().then((url) => {
			if (!/checkout/.test(url)) cy.visit('https://automationexercise.com/checkout');
		});

		// 7) Place order (handle payment if present)
		cy.get('body', { timeout: 10000 }).then(($b) => {
			if (/Place Order|Pay and Confirm Order|Confirm Order|Place Order!/i.test($b.text())) {
				cy.contains(/Place Order|Pay and Confirm Order|Confirm Order|Place Order!/i).first().click({ force: true });
			} else {
				// try a button-like element
				const btn = $b.find('button, a').filter((i, el) => /place order|confirm order|pay now|pay and confirm/i.test(el.innerText)).first();
				if (btn && btn.length) cy.wrap(btn[0]).click({ force: true });
			}
		});

		// Payment filling if payment form appears
		cy.get('body', { timeout: 10000 }).then(($b) => {
			if (/Name on Card|Card Number|CVC|Expiration/i.test($b.text())) {
				cy.get('input[name="name_on_card"], input[placeholder*="Name on Card"]').first().type(`${firstName} ${lastName}`, { force: true });
				cy.get('input[name="card_number"], input[placeholder*="Card Number"]').first().type('4242424242424242', { force: true });
				cy.get('input[name="cvc"], input[placeholder*="CVC"]').first().type('123', { force: true });
				cy.get('input[name="expiry_month"], input[placeholder*="MM"]').first().type('12', { force: true });
				cy.get('input[name="expiry_year"], input[placeholder*="YY"]').first().type('30', { force: true });
				cy.contains(/Pay and Confirm Order|Pay Now|Submit/i).first().click({ force: true });
			}
		});

		// final assertion: order confirmation in body
		cy.get('body', { timeout: 15000 }).should(($body) => {
			const text = $body.text();
			const ok = /Order Placed!|order placed|Your order has been placed successfully|Order Confirmed|Thank you for your purchase/i.test(text);
			expect(ok, 'Order confirmation not found after placing order').to.be.true;
		});
	});
});

