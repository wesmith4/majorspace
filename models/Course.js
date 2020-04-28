let { Model, snakeCaseMappers } = require('objection');

class Course extends Model {
  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  static get tableName() {
    return 'courses';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'departmentId',
        'courseNumber',
      ],
      properties: {
        id: {type: 'integer'},
        departmentId: {type: 'integer'},
        courseNumber: {type: 'string'},
      }
    }
  }

  static get relationMappings() {
    let Department = require('./Department');
    let Request = require('./Request');
    let Review = require('./Review');
    return {
      department: {
        relation: Model.HasOneRelation,
        modelClass: Department,
        join: {
          from: 'courses.department_id',
          to: 'departments.id'
        }
      },
      requests: {
        relation: Model.HasManyRelation,
        modelClass: Request,
        join: {
          from: 'courses.id',
          to: 'review_requests.course_id'
        }
      },
      reviews: {
        relation: Model.HasManyRelation,
        modelClass: Review,
        join: {
          from: 'courses.id',
          to: 'reviews.course_id'
        }
      }
    }
  }
}

module.exports = Course;
