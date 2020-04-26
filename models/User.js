const { Model, snakeCaseMappers } = require('objection');
const Password = require('objection-password');

class User extends Password(Model) {
  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  static get tableName() {
    return 'users';
  }

  static get jsonSchema() {
    return {
      type: 'object',

    }
  }

  static get relationMappings() {

  }
}

module.exports = User;
