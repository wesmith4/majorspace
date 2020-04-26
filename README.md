# Major Space
A site for Davidson College students to interact with members of their department, and share content such as course reviews, upcoming events, and questions/answers.

### Collaborators
- Will Smith
  - [Email](mailto:wismith@davidson.edu)
  - [GitHub](https://github.com/wismith)
- Kendahl Ryan Ross
  - [Email](mailto:keross@davidson.edu)
  - [GitHub](https://github.com/kross00)
- Lilian Korir
  - [Email](mailto:likorir@davidson.edu)
  - [GitHub](https://github.com/LilianKorir)

## Development

### Install required modules
Run ```$ npm install``` in the root project directory to install required modules on your computer.

### Run the development server
```$ npm run dev``` will start the development server with [nodemon](https://www.npmjs.com/package/nodemon), which will restart itself automatically when you save a file in the project directory.  You just need to refresh the page to see the modified output.

## Web Scraping
The ```web-scraping``` folder contains the files we need for scraping our data from the [Davidson.edu](https://davidson.edu) website. Run these on your terminal to see the outputs:

    $ cd web-scraping
    $ node departmentScraper.js

*Note: Each time the ```departmentScraper.js``` script is run, the JSON file in this folder is rewritten.*


## Integration between Github and Heroku
The `master` branch on Github is directly linked to the Heroku app, thus any commits pushed to this branch will be automatically sent to Heroku.

## Domain - https://majorspace.net
This domain is live, connected to the Heroku app.  No need to use the Heroku url to access the web app.

## Database
The database connection is a PostgreSQL setup with [Knex](http://knexjs.org/) and [Objection](https://vincit.github.io/objection.js/guide/getting-started.html).  Here's how it works in the repository:
- `migrations/`: This folder contains the Knex migrations, which tell the Postgres database how to set up the schemas for each table.
  - Methods:
    - Create a new migration: `$ npx knex migrate:make <your_well_named_migration>`
        ```javascript
        // A new table migration
        exports.up = function(knex) {
          return knex.schema.createTable('your_table', function(table) {
            table.increments('id').primary();
            table.text('name').notNullable();
          })
        }

        exports.down = function(knex) {
          return knex.schema.dropTable('your_table');
        }
        ```
    - Update to the latest migrations: `$ npx knex migrate:latest`
    - Roll back the last batch of migrations: `$ npx knex migrate:rollback`
    - Roll back all batches of migrations (be careful): `$ npx knex migrate:rollback --all`
- `models/`: This folder contains the Objection models, which provide a framework for you to perform queries on the database. There should be a file in `models/` for each table in the database.
  - The basic structure for an Objection model is as follows:

      ```javascript
      let { Model, snakeCaseMappers } = require('objection');

      class YourClass extends Model {
        static get columnNameMappers() {
          return snakeCaseMappers();
        }
        static get tableName() {
          return 'name_of_corresponding_table_in_your_database';
        }
        static get jsonSchema() {
          // Not absolutely necessary, but look it up in the Objection documentation
        }
        static get relationMappings() {
          return {
            // Look up the structure for this in the Objection documentation
          }
        }
      }
      module.exports = YourClass;
      ```
