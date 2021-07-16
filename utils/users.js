
let users = [];

//add user
exports.addUser = ({id, username, room} = {}) => {

    //validate
    if(!username || !room){
        return {
            error: 'Username or room are required'
        }
    }

    //clean data
    username = username.trim();
    room = room.trim().toLowerCase();


    //check exist user
    const existingUser = users.find(user => user.username === username && user.room === room);

    if(existingUser){
        return {
            error: 'Username is in use'
        }
    }

    //store user
    const user = {id, username, room};
    users.push(user);
    return { user }
}


//remove user
exports.removeUser = (id) => {
    const user = users.find(user => user.id === id);
    if(!user){
        return {
            error: 'user not exist'
        }
    }
    users = users.filter(user => user.id !== id);
    return { user };
}


//get user
exports.getUser = (id) => {
    const user = users.find(user => user.id === id);
    if(!user){
        return {
            error: 'user not exist'
        }
    }
    return user;
}


//get users in room
exports.getUsersInRoom = (room) => users.filter(user => user.room === room);
   