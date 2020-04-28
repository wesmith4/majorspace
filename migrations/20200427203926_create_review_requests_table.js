
exports.up = function(knex) {
  return knex.schema.createTable('review_requests', (table) => {
    table.increments('id').primary();
    table.integer('course_id').notNullable().references('courses.id');
    table.integer('user_id').notNullable().references('users.id');
    table.timestamp('created_at', {precision: 6}).defaultTo(knex.fn.now(6));
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('review_requests');
};
