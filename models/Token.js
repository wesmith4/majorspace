let { Model, snakeCaseMappers } = require('objection');

class Token extends Model {
  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  static get tableName() {
    return 'verification_tokens';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: {type: 'integer'},
        userId: {type: 'integer'},
        token: {type: 'string'}
      }
    }
  }

  static get relationMappings() {
    let User = require('./User');
    return {
      user: {
        relation: Model.HasOneRelation,
        modelClass: User,
        join: {
          from: 'verification_tokens.user_id',
          to: 'users.id'
        }
      }
    }
  }
}

module.exports = Token;
