const users = [];

const addUser = ({id, username, room}) => {
    
    //sanitize the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //validate the fields
    if(!username || !room) {
        return {
            error: 'please provide username and room'
        }
    }

    //validate the user
    const isUserExists = users.find((user) => {
        return user.username === username && user.room === room
    });

    if(isUserExists) {
        return {
            error: 'a user with the name already exists in the room'
        }
    }

    //happy case
    const user = {id, username, room};
    users.push(user);

    return {user};
};

const removeUser = (id) => {
    const index = users.findIndex( (user) => user.id === id);
    
    if(index !== -1) {
        return users.splice(index,1)[0];
    }
};

const getUser = (id) => {
    return users.find( (user) => user.id === id);
};

const getUsersInRoom = (room) => {
    // const usersInRoom = users.filter( (user) => {
    //     return user.room === room;
    // });
    // return usersInRoom;

    //sanitize the data
    room = room.trim().toLowerCase();

    return users.filter( (user) => user.room === room);
};

module.exports = {
    addUser, getUser, getUsersInRoom, removeUser
};

