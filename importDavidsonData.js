let fs = require('fs');
let Knex = require('knex');
let { Model } = require('objection');
let dbConfig = require('./knexfile');

let knex = Knex(dbConfig[process.env.NODE_ENV]);
Model.knex(knex);

let Department = require('./models/Department');
let Faculty = require('./models/Faculty');

let data = JSON.parse(fs.readFileSync('./web-scraping/davidsonDepartments.json', 'utf-8'));
console.log(data);
async function importDavidsonData(data) {
  return await Department.query().insertGraph(data.map(dept => {
    return {
      name: dept.name,
      departmentUrl: dept.departmentUrl,
      faculty: dept.faculty,
      links: dept.links
    }
  }));
}

(async () => {
  await(importDavidsonData(data));
})();
