/*
eslint no-unused-vars: [
  "error",
  {
    "args": "none",
    "vars": "local",
    "varsIgnorePattern": "data"
  }
]
*/

const data = require('./data');

const { species } = data;
const { employees } = data;
const { prices } = data;
const { hours } = data;

function getSpeciesByIds(...ids) {
  const findId = (id) => species.find((specie) => specie.id === id);
  return ids.map(findId);
}

function getAnimalsOlderThan(animal, age) {
  const animalData = data.species.find((elem) => elem.name === animal);
  return animalData.residents.every((elem) => elem.age >= age);
}

function getEmployeeByName(employeeName) {
  const gotEmployee = employees.find(
    (employee) =>
      employee.firstName === employeeName || employee.lastName === employeeName,
  );
  if (gotEmployee) return gotEmployee;
  return {};
}

function createEmployee(personalInfo, associatedWith) {
  return {
    ...personalInfo,
    ...associatedWith,
  };
}

function isManager(id) {
  return employees.some((employee) =>
    employee.managers.some((elem) => elem === id));
}

function addEmployee(id, firstName, lastName, managers, responsibleFor) {
  const personalInfo = { id, firstName, lastName };
  const associatedWith = {
    managers: managers || [],
    responsibleFor: responsibleFor || [],
  };
  data.employees.push(createEmployee(personalInfo, associatedWith));
}

function countAnimals(speciesInput) {
  if (speciesInput) {
    return species.find((elem) => elem.name === speciesInput).residents
      .length;
  }
  return species.reduce((acc, curr) => {
    acc[curr.name] = curr.residents.length;
    return acc;
  }, {});
}

function calculateEntry(entrants = 0) {
  return Object.entries(entrants).reduce(
    (acc, curr) => prices[curr[0]] * curr[1] + acc,
    0,
  );
}

function speciesLocations() {
  return {
    NE: species
      .filter((specie) => specie.location === 'NE')
      .map((elem) => elem.name),
    NW: species
      .filter((specie) => specie.location === 'NW')
      .map((elem) => elem.name),
    SE: species
      .filter((specie) => specie.location === 'SE')
      .map((elem) => elem.name),
    SW: species
      .filter((specie) => specie.location === 'SW')
      .map((elem) => elem.name),
  };
}

function getAnimalsNames(animal, sex) {
  if (sex) {
    return species
      .find((elem) => elem.name === animal)
      .residents.filter((elem) => elem.sex === sex).map((elem) => elem.name);
  }
  return species
    .find((elem) => elem.name === animal)
    .residents.map((elem) => elem.name);
}

function includeNamesObj(sex) {
  const speciesLoc = speciesLocations();
  return Object.keys(speciesLoc).reduce((acc, curr) => {
    acc[curr] = speciesLoc[curr].map((elem) => ({ [elem]: getAnimalsNames(elem, sex) }));
    return acc;
  }, {});
}

function includeNamesObjSorted(sex) {
  const speciesLoc = speciesLocations();
  return Object.keys(speciesLoc).reduce((acc, curr) => {
    acc[curr] = speciesLoc[curr].map((elem) => ({ [elem]: getAnimalsNames(elem, sex).sort() }));
    return acc;
  }, {});
}

function getAnimalMap(options) {
  if (!options || !options.includeNames) return speciesLocations();
  if (options.includeNames && options.sorted) return includeNamesObjSorted(options.sex);
  return includeNamesObj(options.sex);
}

function dayInfo(day) {
  if (hours[day].open === 0 && hours[day].close === 0) return 'CLOSED';
  return `Open from ${
    hours[day].open < 12 ? `${hours[day].open}am` : `${hours[day].open - 12}pm`
  } until ${
    hours[day].close < 12
      ? `${hours[day].close}am`
      : `${hours[day].close - 12}pm`
  }`;
}

function getSchedule(dayName) {
  if (dayName) return { [dayName]: dayInfo(dayName) };
  return Object.keys(hours).reduce((acc, curr) => {
    acc[curr] = dayInfo(curr);
    return acc;
  }, {});
}

function getOldestFromFirstSpecies(id) {
  const firstAnimalId = employees.find((employee) => employee.id === id)
    .responsibleFor[0];
  const firstAnimal = species.find((specie) => specie.id === firstAnimalId);
  const oldestAnimal = firstAnimal.residents.find(
    (elem) =>
      elem.age
      === firstAnimal.residents.reduce(
        (acc, curr) => (curr.age > acc ? curr.age : acc),
        0,
      ),
  );
  return [...Object.values(oldestAnimal)];
}

function increasePrices(percentage) {
  Object.keys(data.prices).forEach((elem) => {
    const increase = data.prices[elem] + data.prices[elem] * (percentage / 100);
    data.prices[elem] = Number.parseFloat((increase + 0.001).toPrecision(4));
  });
}

const responsibleSpecies = (responsibleFor) =>
  responsibleFor
    .map((id) => species.find((specie) => specie.id === id))
    .map((elem) => elem.name);

function getEmployeeCoverage(idOrName) {
  if (idOrName) {
    const employee = employees.find(
      (currEmployee) =>
        currEmployee.id === idOrName
        || currEmployee.firstName === idOrName
        || currEmployee.lastName === idOrName,
    );
    const fullName = `${employee.firstName} ${employee.lastName}`;
    return { [fullName]: responsibleSpecies(employee.responsibleFor) };
  }

  const employeesResponsibilities = employees.reduce((acc, curr) => {
    acc[`${curr.firstName} ${curr.lastName}`] = responsibleSpecies(curr.responsibleFor);
    return acc;
  }, {});
  return employeesResponsibilities;
}

module.exports = {
  calculateEntry,
  getSchedule,
  countAnimals,
  getAnimalMap,
  getSpeciesByIds,
  getEmployeeByName,
  getEmployeeCoverage,
  addEmployee,
  isManager,
  getAnimalsOlderThan,
  getOldestFromFirstSpecies,
  increasePrices,
  createEmployee,
};
