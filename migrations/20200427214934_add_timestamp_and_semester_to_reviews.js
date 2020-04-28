
exports.up = function(knex) {
  return knex.schema.table('reviews', (table) => {
    table.timestamp('created_at', {precision: 6}).defaultTo(knex.fn.now(6));
    table.text('semester');
  })
};

exports.down = function(knex) {
  return knex.schema.table('reviews', (table) => {
    table.dropColumn('created_at');
    table.dropColumn('semester');
  })
};
