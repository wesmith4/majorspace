
exports.up = function(knex) {
  return knex.schema.createTable('messages', (table) => {
    table.increments('id').primary();
    table.integer('user_id').notNullable().references('users.id');
    table.integer('department_id').notNullable().references('departments.id');
    table.text('subject').notNullable();
    table.text('message_body').notNullable();
    table.integer('parent_message_id').references('messages.id');
    table.boolean('is_question').notNullable().defaultTo(0);
    table.timestamp('created_at', {precision: 6}).defaultTo(knex.fn.now(6));
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('messages');
};
