class UsersTable {
  constructor() {
    this.users = [];
  }
  addUser(newUser) {
    this.users.push(newUser);
  }
  getUser(id) {
    return this.users.find(u => u.id == id);
  }
  getUserIndex(id) {
    const user = this.getUser(id);
    return this.users.indexOf(user);
  }
  deleteUser(id) {
    const index = this.getUserIndex(id);
    if (index > -1) {
      this.users.splice(index, 1);
    }
  }
  editUser(user) {
    const index = this.getUserIndex(user.id);
    if (index > -1) {
      this.users[index] = user;
    }
  }
  getAllUsers() {
    return this.users;
  }
  setAllUsers(users) {
    this.users = users;
  }
  sortUsers(category) {
    switch (category) {
      case "id":
      case "age":
      case "capsule":
        return this.users.sort((u1, u2) => u1[category] - u2[category]);
      default: {
        return this.users.sort((u1, u2) => {
          const textA = u1[category].toLowerCase();
          const textB = u2[category].toLowerCase();
          if (textA)
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
      }
    }
  }
  setCurrentRowHtml(html) {
    this.currentRowHtml = html;
  }
  getCurrentRowHTML() {
    return this.currentRowHtml;
  }
  searchUser(category, value) {
    return this.users.filter(user => (!(user[category]).toString().toLowerCase().includes(value.toLowerCase())));
  }
}
let usersTable = new UsersTable();
const basicUrl = "https://appleseed-wa.herokuapp.com/api/users/";
const usersTableElement = document.querySelector(".usersTable");
let selectedRowHtml;
const searchInput = document.querySelector(".searchInput");
searchInput.addEventListener("input", searchUser);
const searchCategory = document.querySelector("#searchCategories");
searchCategory.addEventListener("change", searchUser);

//SETUP - FIRST EXCUTED FUNCTION
async function setUp() {
  usersTableElement.classList.add("spinner");
  const localStorageValue = localStorage.getItem("usersTable"); //Looks for saved local storage
  if (localStorageValue) {
    const users = JSON.parse(localStorageValue);
    usersTable.setAllUsers(users); //Local storage exsits. Sets the data in the object
  }
  else {//Local storage does not exists.
    await setAllUsersData();
    localStorage.setItem("usersTable", JSON.stringify(usersTable.getAllUsers()));//sets the data in the local storage.
  }
  generateTableHeader();
  generateTableBody();
  generateTable(usersTable.getAllUsers());
  setWeather();
  usersTableElement.classList.remove("spinner");
}

//DATA HANDELING
async function fetchAllUseresData() {
  try {
    const response = await fetch(basicUrl);
    const data = await response.json();
    return data;
  } catch (err) {
    console.log(err);
  }
}
async function fetchUserSpecificData(userId) {
  try {
    const response = await fetch(basicUrl + userId);
    const userData = await response.json();
    return userData;
  } catch (err) {
    console.log(err);
  }
}
async function fetchWheather(city) {
  const apiKey = "appid=3b9f68ff1965ba8493c91f9403e87803";
  const baseUrl = "https://api.openweathermap.org/data/2.5/weather?q=";
  const units = "units=metric";
  const request = [baseUrl + city, units, apiKey];
  try {
    const response = await fetch(request.join("&"));
    const weatherData = await response.json();
    return weatherData.main.temp;
  } catch (err) {
    return "n/a";
  }
}
async function setAllUsersData() {
  const usersData = await fetchAllUseresData();
  for (let i = 0; i < usersData.length; i++) {
    const userAdditionalData = await fetchUserSpecificData(usersData[i].id);
    for (const [key, value] of Object.entries(userAdditionalData)) {
      if (!((Object.keys(usersData[i])).includes(key))) {
        usersData[i][key] = value;
      }
    }
    usersTable.addUser(usersData[i]);
  }
}
async function setWeather() {
  const cities = usersTable.getAllUsers();
  const rows = Array.from(document.querySelectorAll('[data-id]'));
  for (let i = 0; i < rows.length; i++) {
    const w = await fetchWheather(rows[i].children[5].textContent);
    rows[i].children[5].dataset.weather = w + '℃';
  }
}
setInterval(setWeather, 600000);//will update the weather every 10 minutes  

//TABLE ACTION HANDELING
function editRow(currentRow) {
  setSelected(currentRow, "selectedRow");
  const id = currentRow.dataset.id;
  const userData = usersTable.getUser(id);
  const tds = currentRow.children;
  for (let i = 1; i < tds.length - 1; i++) { //Skips the id cell and the action button cell

    tds[i].innerHTML = `<input value="${Object.values(userData)[i]}"></input>`;
  }
  changeIcons(currentRow.lastElementChild.firstElementChild, "fa-user-edit", "fa-undo"); //change button from edit to cancle
  changeIcons(currentRow.lastElementChild.lastElementChild, "fa-user-slash", "fa-user-check");//change button from delete to confirm
}
function cancleEdit(currentRow) {
  finishEdit(currentRow);
}
function deleteRow(currentRow) {
  usersTable.deleteUser(currentRow.dataset.id);
  updateLocalStorage();
  currentRow.remove();
}
function saveEdit(currentRow) {
  const newUserData = {
    id: currentRow.dataset.id,
    firstName: currentRow.children[1].firstElementChild.value,
    lastName: currentRow.children[2].firstElementChild.value,
    capsule: currentRow.children[3].firstElementChild.value,
    age: currentRow.children[4].firstElementChild.value,
    city: currentRow.children[5].firstElementChild.value,
    gender: currentRow.children[6].firstElementChild.value,
    hobby: currentRow.children[7].firstElementChild.value
  };
  usersTable.editUser(newUserData);
  updateLocalStorage();
  finishEdit(currentRow);
}
function finishEdit(currentRow) {
  const tds = currentRow.children;
  const userData = usersTable.getUser(currentRow.dataset.id);
  for (let i = 1; i < tds.length - 1; i++) { //Skips the id cell and the action button cell
    tds[i].innerHTML = `${Object.values(userData)[i]}`;
  }
  changeIcons(currentRow.lastElementChild.firstElementChild, "fa-undo", "fa-user-edit"); //change button from cancle to edit
  changeIcons(currentRow.lastElementChild.lastElementChild, "fa-user-check", "fa-user-slash");//change button from confirm to delete 
  removeSelectedRow(currentRow);
}
function hideUsers(users) {
  const tableRows = Array.from(document.querySelectorAll('[data-id]'));//Select all rows with data-id (everything but the header row)
  users.forEach(user => {
    (tableRows.find(row => row.dataset.id == user.id)).classList.add("hidden");
  });
}

//TABLE GENERATION
function generateTableHeader() {
  const tableHead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headerRow.innerHTML = `<th>ID <i class="fas fa-sort-amount-down-alt sortBtn"></i></th>
  <th>First Name <i class="fas fa-sort-amount-down-alt sortBtn action"></i></th>
  <th>Last Name <i class="fas fa-sort-amount-down-alt sortBtn action"></i></th>
  <th>Capsule <i class="fas fa-sort-amount-down-alt sortBtn action"></i></th>
  <th>Age <i class="fas fa-sort-amount-down-alt sortBtn action"></i></th>
  <th>City <i class="fas fa-sort-amount-down-alt sortBtn action"></i></th>
  <th>Gender <i class="fas fa-sort-amount-down-alt sortBtn action"></i></th>
  <th>Hobby <i class="fas fa-sort-amount-down-alt sortBtn action"></i></th>
  <th>Action</th>`
  tableHead.appendChild(headerRow);
  usersTableElement.appendChild(tableHead);
}
function generateTableBody(userArray) {
  const tableBody = document.createElement("tbody");
  usersTableElement.appendChild(tableBody);
}
function generateTable(userArray) {
  const tableBody = document.querySelector("tbody");
  tableBody.innerHTML = "";
  userArray.forEach(user => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${user.id}</td>
    <td>${user.firstName}</td>
    <td>${user.lastName}</td>
    <td>${user.capsule}</td>
    <td>${user.age}</td>
    <td class="city" data-weather="">${user.city}</td>
    <td>${user.gender.toUpperCase()}</td>
    <td>${user.hobby}</td>
    <td class="action"><i class="fas fa-user-edit lBtn"></i></i>
    <i class="fas fa-user-slash rBtn"></i> </td>`;
    row.setAttribute("data-id", user.id);
    tableBody.appendChild(row);
  })
  addBtnsEvents();
}

//UTILITIES
function addEvent(elements, eventType, callBackFunction) {

  elements.forEach(element => element.addEventListener(eventType, callBackFunction));
}
function addBtnsEvents() {
  const editButns = document.querySelectorAll(".lBtn");
  addEvent(editButns, "click", clickOnEditOrCancle);

  const deleteButns = document.querySelectorAll(".rBtn");
  addEvent(deleteButns, "click", clickOnDeleteOrConfirm);

  const sortBtns = document.querySelectorAll(".sortBtn");
  addEvent(sortBtns, "click", clickOnSort);

}
function getParentRow(event) {
  return event.currentTarget.parentElement.parentElement;
}
function updateLocalStorage() {
  localStorage.setItem("usersTable", JSON.stringify(usersTable.getAllUsers()));
}
function parseCategory(category) {
  category = category.toLowerCase().trim();
  tempArray = category.split(" ");
  tempArray.forEach((word, i) => {
    if (i > 0) {
      tempArray[i] = word.charAt(0).toUpperCase() + word.slice(1);
    }
  })
  return tempArray.join('');
}
function setSelected(element, className) {
  const selected = document.querySelector(`.${className}`);
  if (selected) { //At first nothing is selected
    selected.classList.remove(className);
  }
  element.classList.add(className);
  if (className === "selectedRow") {
    const actionTds = document.querySelectorAll(".action");
    actionTds.forEach(td => td.classList.add("disableAction"))//Disable all action buttons
    element.lastElementChild.classList.remove("disableAction");//Enable only the selected row buttons
  }
}
function removeSelectedRow(selectedRow) {
  selectedRow.classList.remove("selectedRow");
  const actionTds = document.querySelectorAll(".action");
  actionTds.forEach(td => td.classList.remove("disableAction"))//Enable all action buttons
}
function changeIcons(element, remove, add) {
  element.classList.remove(remove);
  element.classList.add(add);
}
function removeHidden() {
  const hidden = document.querySelectorAll(".hidden");
  hidden.forEach(row => row.classList.remove("hidden"));
}

//EVENT LISTENERS
function clickOnSort(event) {
  setSelected(event.currentTarget, "selectedSort");
  const category = parseCategory(event.currentTarget.parentElement.textContent);
  generateTable(usersTable.sortUsers(category));
  setWeather();
}

function clickOnEditOrCancle(event) {
  const currentRow = getParentRow(event);
  if (event.currentTarget.classList.contains("fa-undo")) { //User clicked undo
    cancleEdit(currentRow);
  }
  else {//User clicked Edit
    editRow(currentRow);
  }
}

function clickOnDeleteOrConfirm(event) {
  const currentRow = getParentRow(event);
  if (event.currentTarget.classList.contains("fa-user-check")) { //User clicked confirm
    saveEdit(currentRow);
  }
  else {//User clicked Edit
    deleteRow(currentRow);
  }
}

function searchUser(event) {
  removeHidden();
  if (event.currentTarget.value != "") {
    const category = searchCategory.value;
    const usersToHide = usersTable.users.filter(user => (!(user[category]).toString().toLowerCase().includes(searchInput.value.toLowerCase())));
    hideUsers(usersToHide);
  }
}
