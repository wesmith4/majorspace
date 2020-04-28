
exports.up = function(knex) {
  return knex.schema.createTable('message_likes', (table) => {
    table.increments('id').primary();
    table.integer('message_id').notNullable().references('messages.id');
    table.integer('user_id').notNullable().references('users.id');
    table.timestamp('created_at', {precision: 6}).defaultTo(knex.fn.now(6));
    table.unique(['user_id', 'message_id']);
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('message_likes');
};
