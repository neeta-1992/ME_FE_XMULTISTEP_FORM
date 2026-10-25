describe('Multi-step Form', () => {
  beforeEach(() => {
    cy.visit('http://15.252.143.50:8081/');
  });

  it('should load the initial step correctly', () => {
    cy.contains('Step 1').should('be.visible');
    cy.get('input[name="userName"]').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="phone"]').should('be.visible');
    cy.get('button#next-button').should('be.visible');
  });

  it('should navigate through the steps with valid input', () => {
    // Step 1: Fill in the required fields
    cy.get('input[name="userName"]').type('Stephen King');
    cy.get('input[name="email"]').type('stephenking@lorem.com');
    cy.get('input[name="phone"]').type('7894561230');
    cy.get('button#next-button').click();

    // Verify Step 2
    cy.contains('Step 2').should('be.visible');
    cy.get('.plan_card').first().click();
    cy.get('button#next-button').click();

    // Verify Step 3
    cy.contains('Step 3').should('be.visible');
    cy.get('.addon_card').each(($el) => {
      cy.wrap($el).click();
    });
    cy.get('button#next-button').click();

    // Verify Step 4
    cy.contains('Step 4').should('be.visible');
    cy.get('button#next-button').click();

    // Verify Final Step
    cy.contains('Thank You!').should('be.visible');
  });

  it('should allow plan selection and proceed to next step', () => {
    // Step 1: Fill in the required fields
    cy.get('input[name="userName"]').type('Stephen King');
    cy.get('input[name="email"]').type('stephenking@lorem.com');
    cy.get('input[name="phone"]').type('7894561230');
    cy.get('button#next-button').click();

    // Step 2: Select a plan
    cy.get('.plan_card').first().click();
    cy.get('.plan_card').first().should('have.class', 'selected');
  });

  it('should display a validation message if the e-mail is not in correct format', () => {
    // Step 1: Fill in the required fields
    cy.get('input[name="userName"]').type('Stephen King');
    cy.get('input[name="email"]').type('stephenking');
    cy.get('input[name="phone"]').type('7894561230');
    cy.get('button#next-button').click();
    cy.get('input[name="email"]').then(($input) => {
      expect($input[0].validationMessage).to.exist;
    });
  });

  it('should allow add-ons selection and proceed to next step', () => {
    // Step 1: Fill in the required fields
    cy.get('input[name="userName"]').type('Stephen King');
    cy.get('input[name="email"]').type('stephenking@lorem.com');
    cy.get('input[name="phone"]').type('7894561230');
    cy.get('button#next-button').click();

    cy.get('.plan_card').first().click();
    cy.get('button#next-button').click();

    // Step 3: Select add-ons
    cy.get('.addon_card').each(($el) => {
      cy.wrap($el).click();
      cy.wrap($el).find('input[type="checkbox"]').should('be.checked');
    });
  });


  it('should display validation messages when required fields are empty', () => {
    // Attempt to proceed to the next step without filling any fields
    cy.get('button#next-button').click();

    // Verify that validation messages are displayed
    cy.get('input[name="userName"]').then(($input) => {
      expect($input[0].validationMessage).to.exist;
    });

    cy.get('input[name="email"]').then(($input) => {
      expect($input[0].validationMessage).to.exist;
    });

    cy.get('input[name="phone"]').then(($input) => {
      expect($input[0].validationMessage).to.exist;
    });

    // Fill in only the name and try to proceed
    cy.get('input[name="userName"]').type('Stephen King');
    cy.get('button#next-button').click();

    // Verify that validation messages are still displayed for other fields
    cy.get('input[name="email"]').then(($input) => {
      expect($input[0].validationMessage).to.exist;
    });

    cy.get('input[name="phone"]').then(($input) => {
      expect($input[0].validationMessage).to.exist;
    });

    // Fill in only the email and try to proceed
    cy.get('input[name="email"]').type('stephenking@lorem.com');
    cy.get('button#next-button').click();

    // Verify that validation message is still displayed for phone field
    cy.get('input[name="phone"]').then(($input) => {
      expect($input[0].validationMessage).to.exist;
    });

    // Fill in the phone field and try to proceed
    cy.get('input[name="phone"]').type('+1 234 567 890');
    cy.get('button#next-button').click();

    // Verify that the form proceeds to the next step
    cy.contains('Step 2').should('be.visible');
  });
});

