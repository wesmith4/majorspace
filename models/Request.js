let { Model, snakeCaseMappers } = require('objection');

class Request extends Model {
  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  static get tableName() {
    return 'review_requests';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'courseId'
      ],
      properties: {
        id: {type: 'integer'},
        courseId: {type: 'integer'},
        userId: {type: 'integer'}
      }
    }
  }

  static get relationMappings() {
    let Course = require('./Course');
    let User = require('./User');
    return {
      course: {
        relation: Model.HasOneRelation,
        modelClass: Course,
        join: {
          from: 'review_requests.course_id',
          to: 'courses.id'
        }
      },
      user: {
        relation: Model.HasOneRelation,
        modelClass: User,
        join: {
          from: 'review_requests.user_id',
          to: 'users.id'
        }
      }
    }
  }
}

module.exports = Request;
