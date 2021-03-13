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
    console.log(category);
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
    console.log("setting current:", html);
  }
  getCurrentRowHTML() {
    console.log("returning:", this.currentRowHtml);
    return this.currentRowHtml;
  }
}
let usersTable = new UsersTable();
const basicUrl = "https://appleseed-wa.herokuapp.com/api/users/";
const usersTableElement = document.querySelector(".usersTable");
let selectedRowHtml;

//SETUP - FIRST EXCUTED FUNCTION
async function setUp() {
  const localStorageValue = localStorage.getItem("usersTable"); //Looks for saved local storage
  if (localStorageValue) {
    console.log("found useres in storage");
    const users = JSON.parse(localStorageValue);
    usersTable.setAllUsers(users); //Local storage exsits. Sets the data in the object
  }
  else {//Local storage does not exists.
    console.log(" did NOT find useres in storage");
    await setAllUsersData();
    localStorage.setItem("usersTable", JSON.stringify(usersTable.getAllUsers()));//sets the data in the local storage.
  }
  generateTableHeader();
  generateTableBody();
  generateTable(usersTable.getAllUsers());
}

//DATA HANDELING
async function fetchAllUseresData() {
  try {
    const response = await fetch(basicUrl);
    const data = await response.json();
    return data;
  } catch (err) {
    console.log("err:", err);
  }
}
async function fetchUserSpecificData(userId) {
  try {
    const response = await fetch(basicUrl + userId);
    const userData = await response.json();
    return userData;
  } catch (err) {
    console.log("err:", err);
  }
}
async function setAllUsersData() {
  console.log("setAllusers starts:", usersTable.users);
  const usersData = await fetchAllUseresData();
  console.log(usersData.length);
  for (let i = 0; i < usersData.length; i++) {
    const userAdditionalData = await fetchUserSpecificData(usersData[i].id);
    for (const [key, value] of Object.entries(userAdditionalData)) {
      if (!((Object.keys(usersData[i])).includes(key))) {
        usersData[i][key] = value;
      }
    }
    usersTable.addUser(usersData[i]);
  }
  console.log("setAllusers ends:", usersTable.users);
}

//TABLE ACTION HANDELING
function editRow(currentRow) {
  console.log("edit");
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
  console.log("delete row");
  usersTable.deleteUser(getParentRow(event).dataset.id);
  updateLocalStorage();
  currentRow.remove();
}
function saveEdit(currentRow) {
  console.log("save edit");
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
  console.log(usersTable.getUser(newUserData.id));
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
    <td>${user.city}</td>
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


//EVENT LISTENERS
function clickOnSort(event) {
  setSelected(event.currentTarget, "selectedSort");
  const category = parseCategory(event.currentTarget.parentElement.textContent);
  generateTable(usersTable.sortUsers(category));
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
