[
  {
    id: "/#12poiajdspfoif",
    name: "Andrew",
    room: "The Office Fans"
  }
];

// addUser(id, name, room)
// removeUser(id)
// getUser(id)
// getUserList(room)

class Users {
  constructor() {
    this.users = [];
  }
  addUser(id, name, room) {
    var user = { id, name, room };
    this.users.push(user);
    return user;
  }
  removeUser(id) {
    var user = this.getUser(id);

    if (user) {
      this.users = this.users.filter(user => user.id !== id);
    }

    return user;
  }
  getUser(id) {
    return this.users.filter(user => user.id === id)[0];
  }

  getUserList(room) {
    var users = this.users.filter(user => user.room === room);
    var namesArray = users.map(user => user.name);

    return namesArray;
  }

  getUserName(name, room) {
    if (this.users.length > 0) {
      for (var i = 0; i < this.users.length; i++) {
        if (this.users[i].name === name && this.users[i].room === room) {
          console.log("user round");
          return 1;
        }
      }
    } else {
      return 0;
    }
  }

  getRoomList() {
    var Currentrooms = [];
    this.users.map(dat => {
      Currentrooms.push(dat.room);
    });
    var Currentrooms;

    var newArr = Currentrooms;

    for (var h = 0; h < Currentrooms.length; h++) {
      var curItem = Currentrooms[h];
      var foundCount = 0;
      // search array for item
      for (var i = 0; i < Currentrooms.length; i++) {
        if (Currentrooms[i] == Currentrooms[h]) foundCount++;
      }
      if (foundCount > 1) {
        // remove repeated item from new array
        for (var j = 0; j < newArr.length; j++) {
          if (newArr[j] == curItem) {
            newArr.splice(j, 1);
            j = j - 1;
          }
        }
      }
    }
    return newArr;
  }

  getUserSocketList(room) {
    var users = this.users.filter(user => user.room === room);
    var socketsArray = users.map(user => user.id);

    return socketsArray;
  }
}

module.exports = { Users };
