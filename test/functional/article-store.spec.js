'use strict'

/**
 * Lausanne-Sport eSports API Source Code.
 *
 * @license GPLv3
 * @copyright Lausanne-Sport eSports - Romain Lanz
 */

const Factory = use('Factory')
const { before, test, trait } = use('Test/Suite')('Article Store')
const { testRequireField, testNumberField } = require('../helpers')
let user = null

trait('Auth/Client')
trait('Session/Client')
trait('Test/ApiClient')
trait('DatabaseTransactions')

const article = {
  headline: 'My First Article',
  description: null,
  body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Odit veritatis rerum amet odio nostrum perferendis neque, vitae impedit aspernatur placeat?',
  // published_at: '04/03/1994 11pm',
  template_id: 1,
  state_id: 1,
  category_id: 1,
  language_id: 2,
}

before(async () => {
  user = await Factory.model('App/Models/User').create()
})

test('should be able to create article with valid data', async ({ assert, client }) => {
  const response = await client
    .post('admin/articles')
    .loginVia(user)
    .send(article)
    .end()

  response.assertStatus(200)
  response.assertJSONSubset({
    category_id: article.category_id,
    template_id: article.template_id,
    translations: [{
      headline: article.headline,
      description: article.description,
      body: article.body,
      state_id: article.state_id,
      language_id: article.language_id,
    }]
  })
})

test('should be able to translate an existing article', async ({ assert, client }) => {
  const article = await Factory.model('App/Models/Article').create()

  const response = await client
    .post(`admin/articles/${article.id}/translations`)
    .loginVia(user)
    .send({
      headline: 'Mon premier article',
      description: null,
      body: 'Lorem',
      state_id: 1,
      language_id: 1,
    })
    .end()

  response.assertStatus(200)
  response.assertJSONSubset({
    id: article.id,
    category_id: article.category_id,
    template_id: article.template_id,
    translations: [{
      headline: 'Mon premier article',
      description: null,
      body: 'Lorem',
      state_id: 1,
      language_id: 1,
    }],
  })
})

test('shouldn\'t be able to translate an article twice in the same language', async ({ assert, client }) => {
  const article = await Factory.model('App/Models/Article').create()
  const translation = await Factory.model('App/Models/ArticleTranslation').make({ language_id: 1 })

  await article.translations().create(translation.toJSON())

  const response = await client
    .post(`admin/articles/${article.id}/translations`)
    .loginVia(user)
    .send({
      headline: 'Mon premier article',
      description: null,
      body: 'Lorem',
      state_id: 1,
      language_id: 1,
    })
    .end()

  response.assertStatus(400)
})

test(`should test that body is required`, async ({ assert, client }) => {
  await testRequireField('body', article, 'admin/articles', user, assert, client)
})

test(`should test that headline is required`, async ({ assert, client }) => {
  await testRequireField('headline', article, 'admin/articles', user, assert, client)
})

test(`should test that language_id is required`, async ({ assert, client }) => {
  await testRequireField('language_id', article, 'admin/articles', user, assert, client)
})

test(`should test that state_id is required`, async ({ assert, client }) => {
  await testRequireField('state_id', article, 'admin/articles', user, assert, client)
})

test(`should test that template_id is required`, async ({ assert, client }) => {
  await testRequireField('template_id', article, 'admin/articles', user, assert, client)
})

test(`should test that category_id is required`, async ({ assert, client }) => {
  await testRequireField('category_id', article, 'admin/articles', user, assert, client)
})

test(`should test that language_id must be a number`, async ({ assert, client }) => {
  await testNumberField('language_id', article, 'admin/articles', user, assert, client)
})

test(`should test that state_id must be a number`, async ({ assert, client }) => {
  await testNumberField('state_id', article, 'admin/articles', user, assert, client)
})

test(`should test that template_id must be a number`, async ({ assert, client }) => {
  await testNumberField('template_id', article, 'admin/articles', user, assert, client)
})

test(`should test that category_id must be a number`, async ({ assert, client }) => {
  await testNumberField('category_id', article, 'admin/articles', user, assert, client)
})
