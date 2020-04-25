const axios = require('axios');
const cheerio = require('cheerio');

let ROOT = 'https://www.davidson.edu';

const DEPARTMENTS_PATH = '/academic-departments';

const loadData = async (root, path) => {
  console.log('Fetching data from site...');
  let url = root + path;
  const result = await axios.get(url);
  return cheerio.load(result.data);
}

const getDepartmentPaths = async () => {
  console.log('Function getDepartmentPaths has started');
  const $ = await loadData(ROOT, DEPARTMENTS_PATH);
  // let data = $('.three-column').find('li').text();
  let departments = Array.from($('a', '.three-column').map((i, listItem) => {
    return {name: listItem.children[0].data, path: listItem.attribs.href};
  }));
  // console.log(departments);
  return departments;
}

const getDeptFaculty = async (root, deptPath) => {

  // deptPath = '/academic-departments/economics'
  const $ = await loadData(ROOT, deptPath + '/faculty-staff');

  let faculty = await Array.from($('.person-teaser').map(async (i, listItem) => {
    let contactInfo = Array.from($(listItem).find('.person-teaser__contact a').map((i, element) => {
      return element.children;
    }));

    // Return object for each faculty member
    return {
      name: $(listItem).find('.person-teaser__name').text().trim(),
      titles: $(listItem).find('.person-teaser__titles').text().trim(),
      expertiseAreas: Array.from($(listItem).find('.person-teaser__list li').map((i, element) => {
        return element.children[0].data;
      })),
      email: (contactInfo[1] ? contactInfo[0].data : null),
      phone: (contactInfo[1] ? contactInfo[1].data : contactInfo[0].data),
      office: $(listItem).find('div .person-teaser__contact').find('div').text().trim(),
      imageUrl: root + $(listItem).find('img').attr('src')
    };
  }));

  // console.log(faculty);
  return faculty;
}

async function loadDavidsonFaculyByDept() {
  let departments = await getDepartmentPaths();
  console.log(departments);

  try {
    departments.map(async (i, element) => {
      element['faculty'] = await getDeptFaculty(ROOT, element.path);
    })
  } catch {
    console.log('An error occurred while retrieving faculty.');
  }

  console.log(departments);
  return departments;
}
// loadDavidsonFaculyByDept();

let run = async () => {

  let departments = await getDepartmentPaths();
  console.log(departments);

  try {
    await Promise.all(departments.map(async(each) => {
      each['faculty'] = await getDeptFaculty(ROOT, each.path);
    }));
  } catch {
    console.log('Adding faculty to departments is hanging...');
  }

  console.log(departments);

}
run();

let runOnlyFaculty = async () => {
  console.log('Isolating the econ department faculty...')
  let econFaculty = await getDeptFaculty(ROOT, '/academic-departments/economics');
  console.log(econFaculty);
}

runOnlyFaculty()
