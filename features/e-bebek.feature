@smoke
Feature: e-bebek E-commerce Website Automation
  As a customer
  I want to complete the full e-commerce journey
  So that I can purchase baby products online

  Background:
    Given I open the homepage
    And I accept the cookies if present

  @search-flow
  Scenario: Product search and validation
    # 1. Ana sayfa ve navigasyon
    Given I am on the "home" page

    # 2. Arama ve sonuç doğrulama
    When I search for "biberon"
    Then I should see text "biberon" in results
    And I should see 1 or more elements with selector "[data-testid*='product-card'], .product-item, .product-card"

    # 3. Ana sayfaya geri dönüş
    When I navigate back to homepage
    Then I should see the page title contains "ebebek"

  @cart-flow
  Scenario: Add to cart functionality
    # 1. Ana sayfa ve navigasyon
    Given I am on the "home" page

    # 2. Arama ve sonuç doğrulama
    When I search for "biberon"
    Then I should see text "biberon" in results
    And I should see 1 or more elements with selector "[data-testid*='product-card'], .product-item, .product-card"

    # 3. Sepete ürün ekleme
    When I add the first product to the cart
    Then the cart counter should be at least 1
    When I open the cart
    Then I should see items in the cart
    And I should see the page title contains "Sepet"

  @login-flow
  Scenario: Login flow (to be fixed)
    # 1. Giriş (Login) - Bu kısım düzeltilecek
    Given I have a valid user account
    When I open login
    And I sign in with valid credentials
    Then I should be logged in

    # 4. Çıkış (Logout)
    When I log out
    Then I should see the login button
