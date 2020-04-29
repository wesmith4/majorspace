
exports.up = function(knex) {
  return knex.schema.table('reviews', (table) => {
    table.text('course_title').notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('reviews', (table) => {
    table.dropColumn('course_title');
  })
};
