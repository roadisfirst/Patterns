//Component
class Employee {
    static get EMPLOYEES(){
        if (!this._EMPLOYEES){
            this._EMPLOYEES = [];
        }
        return this._EMPLOYEES;
    }
    constructor(props){
        this.id = props.id;
        this.rm_id = props.rm_id;
        this.name = props.name;
        this.performance = props.performance;
        this.last_vacation_date = props.last_vacation_date;
        this.salary = props.salary;
        this.strategy = '';

        this.setStrategy = (strategy) => { 
          this.strategy = strategy;
        }
        this.showInfo = (workers) => this.strategy.showInfo(workers);
        this.parentsNum = 0;
        Employee.EMPLOYEES.push(this);
    }

    getSalary() {
        return this.salary;
    }

    getPerformance() {
      return this.performance;
  }

    showHierarchy (){
        return this.name;
    }
}
//Leaf
class Developer extends Employee {}
//Composite
class RM extends Employee {
constructor (props){
        super(props)
        this.pool=[];
        this.pool_name = props.pool_name;
    }

    add(employee){
        employee.parentsNum = this.parentsNum + 1;
        employee.rm_id = this.id;
        this.pool.push(employee);
      }

    remove(employee){
      for(let i in this.pool){
        if(this.pool[i] === employee){
          this.pool.splice(i, 1);
        }
      }
    }
}

class UnitsStrategy {
  constructor() {
    this.showInfo = function (workers) {
      let avrgSalary;
      let unitPerfomance = { 'low': 0, 'average': 0, 'top': 0 };
      let sumSalary = 0;
      let performance, avrgPerfomance;
      const rounding = 0;
      for (let i in workers) {
        if (workers.hasOwnProperty(i)){
          sumSalary = sumSalary + workers[i].getSalary();
          performance = workers[i].getPerformance();
          unitPerfomance[performance] += 1;
        }
      }
      let maxValue = Math.max.apply(Math, Object.values(unitPerfomance).map(val => val));
      avrgPerfomance = Object.keys(unitPerfomance).find(key => unitPerfomance[key] === maxValue);
      avrgSalary = sumSalary / workers.length;
      return { avrgSalary: avrgSalary.toFixed(rounding), avrgPerfomance: avrgPerfomance };
    };
  }
}

class IndividualStrategy {
  constructor() {
    this.showInfo = function (worker) {
      return { salary: worker.getSalary(), performance: worker.getPerformance() };
    };
  }
}

const unitsStrategy = new UnitsStrategy();
const individualStrategy = new IndividualStrategy();

const showInnerPull = (employee) => {
  let parentLiId = `worker${employee.id}`;
  if(employee.pool){
    const li = document.getElementById(parentLiId);
    li.classList.add('rm-style');
    let innerOl = document.createElement('ol');
    li.append(innerOl);
    for(let i in employee.pool){
      if (employee.pool.hasOwnProperty(i)){
        let innerLi = document.createElement('li');
        let innerSpan = document.createElement('span');
        innerLi.id = `worker${employee.pool[i].id}`;
        innerSpan.innerHTML = employee.pool[i].showHierarchy();
        innerLi.append(innerSpan);
        innerOl.append(innerLi);
        showInnerPull(employee.pool[i]);
      }
    }
  }
}

const idNameCreator = (str) => { 
  return str.replace(/\s+/g, '-').toLowerCase();
}

const showInnerUnit = (employee) => {
  if(employee.pool){
    let ulId = idNameCreator(employee.pool_name);
    let parentUl = document.getElementById(ulId);
    if(!parentUl) {
      parentUl = document.createElement('ul');
      parentUl.id = ulId;
      let liId = `list-${employee.rm_id}`;
      let parentLi = document.getElementById(liId);
      parentLi.append(parentUl);
    }
    let liId = `list-${employee.id}`;
    let li = document.createElement('li');
    li.id = liId;
    let avrgInfo = employee.showInfo(employee.pool);
    li.innerHTML = `<h3>${employee.pool_name}</h3><p>Average salary by pool: 
      <span class='accent'>${avrgInfo.avrgSalary}</span></p>
      <p>Average performance by pool: <span class="accent">${avrgInfo.avrgPerfomance}</span></p>`;
    parentUl.append(li);
    for(let i in employee.pool){
      if (employee.pool.hasOwnProperty(i)){
        showInnerUnit(employee.pool[i]);
      }
    }
  }
}

const clearPage = () => {
  const list = document.getElementById('list');
  list.innerHTML = '';
}

const showAllEmployees = () => {
  clearPage();
  const list = document.getElementById('list');
  const head = Employee.EMPLOYEES[0];
  let ol = document.createElement('ol');
  ol.classList.add('workers-list');
  let li = document.createElement('li');
  let span = document.createElement('span');
  li.id = `worker${head.id}`;
  span.innerHTML = head.showHierarchy();
  li.append(span);
  ol.append(li);
  list.append(ol);
  showInnerPull(head);
}

const showAllUnits = () => {
  clearPage();
  const list = document.getElementById('list');
  const head = Employee.EMPLOYEES[0];
  let ul = document.createElement('ul');
  ul.classList.add('units-list');
  ul.id = idNameCreator(head.pool_name);
  list.append(ul);
  showInnerUnit(head);
}

const showWarningEmployees = () => {
  clearPage();
  const warningEmployees = [];
  Employee.EMPLOYEES.forEach(worker => {
    if(worker instanceof Developer){
      let workerRM = Employee.EMPLOYEES.filter(person => person.id === worker.rm_id && person.pool.includes(worker))[0];
      let avrgPoolData = workerRM.showInfo(workerRM.pool);
      let workerData = worker.showInfo(worker);
      if(workerData.salary > avrgPoolData.avrgSalary && worker.getPerformance() === 'low'){
        warningEmployees.push(worker);
      }
    }
  })
  let list = document.getElementById('list');
  let p = document.createElement('p');
  p.classList.add('warning-criterions');
  p.innerHTML = `<span class='accent'>Performance: low, salary: above avarage by pool</span>`;
  list.append(p);
  let ol = document.createElement('ol');
  ol.id = 'warning-list';
  warningEmployees.forEach(person => {
    let li = document.createElement('li');
    li.classList.add('warning-list-item')
    li.innerHTML = `${person.name}: performance <span class='accent'>${person.performance}</span> 
      and salary <span class='accent'>${person.salary}</span>`;
    ol.append(li);
  })
  p.after(ol);
}

document.onclick = function(event){
  if(event.target && event.target.id === 'allEmployees'){
    showAllEmployees();
  }
  if(event.target && event.target.id === 'allUnits'){
    showAllUnits();
  }
  if(event.target && event.target.id === 'warningEmployees'){
    showWarningEmployees();
  }
}

const fillPool = (rmId) => {
  let pull = Employee.EMPLOYEES.filter(worker => worker.rm_id === rmId);
  let rm = Employee.EMPLOYEES.filter(worker => worker.id === rmId);
  pull.forEach(worker => {
    rm[0].add(worker);
  })
}

const getEmployees = () => {
  const data = fetch('../mock.JSON')
    .then(response => response.json())
    .then(data => data.forEach((elem, index) => {
      let name = 'worker' + (index+1);
      if(elem['pool_name']){
        name = new RM(elem);
        name.setStrategy(unitsStrategy);
      } else {
        name = new Developer(elem);
        name.setStrategy(individualStrategy);
      }
    })
    )
    .then(() => Employee.EMPLOYEES.forEach(worker => {
      if(worker instanceof RM){
        fillPool(worker.id);
      }
    })
    )
  return data;
}

const mock = getEmployees();

// async function getEmployees() {
//   const response = await fetch('../mock.JSON');
//   const data = await response.json();
//   data.forEach((elem, index) => {
//       let name = 'worker' + (index+1);
//       if(elem['pool_name']){
//           name = new RM(elem);
//           name.setStrategy(unitsStrategy);
//       } else {
//           name = new Developer(elem);
//           name.setStrategy(individualStrategy);
//       }
//   })
//   Employee.EMPLOYEES.forEach(worker => {
//     if(worker instanceof RM){
//       fillPool(worker.id);
//     }
//   })
//   return data;
// }