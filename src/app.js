class User {
  constructor(id, firstName, lastName, capsule) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.capsule = capsule;
    this.age = NaN;
    this.city = undefined;
    this.gender = undefined;
    this.hobby = undefined;
  }
}

class UsersTable {
  constructor() {
    this.users = [];
  }
  addUser(id, firstName, lastName, capsule) {
    const user = new User(id, firstName, lastName, capsule);
    this.users.push(user);
  }
  //if empty returns undefined
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
    const index = this.getUserIndex(user);
    if (index > -1) {
      this.users[index] = user;
    }
  }
}

let usersTable = new UsersTable();
const basicUrl = "https://appleseed-wa.herokuapp.com/api/users/";

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
  const response = await fetch(basicUrl + userId);
  const userData = await response.json();
  return userData;
}

function setAllUsersData(usersData) {
  usersData.forEach(user => {
    usersTable.addUser(user.id, user.firstName, user.lastName, user.capsule);
  });
}

async function setUserSpecificData() {
  try {
    for (let i = 0; i < usersTable.users.length; i++) {
      const userData = await fetchUserSpecificData(usersTable.users[i].id);
      usersTable.users[i].age = userData.age;
      usersTable.users[i].city = userData.city;
      usersTable.users[i].gender = userData.gender;
      usersTable.users[i].hobby = userData.hobby;
    }
  } catch (err) {
    console.log(err);
  }
}

//SETUP
async function setUp() {

  const localStorageValue = localStorage.getItem("usersTable"); //Looks for saved local storage
  if (localStorageValue) {
    console.log("found useres in storage");
    usersTable = JSON.parse(localStorageValue);//Local storage exsits. Sets the data in the object
  }
  else {//Local storage does not exists.
    console.log(" did NOT found useres in storage");
    const usersData = await fetchAllUseresData(); //fetch the data
    setAllUsersData(usersData);
    await setUserSpecificData();
    localStorage.setItem("usersTable", JSON.stringify(usersTable));//sets the data in the local storage.
  }
  console.log(usersTable);
}
