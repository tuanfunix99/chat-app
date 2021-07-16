
exports.generateMessage = (text, username) => {
    return {
        text: text,
        username: username,
        createdAt: new Date().getTime()
    }
}

exports.generateLocation = (url, username) => {
    return{
        url: url,
        username: username,
        createdAt: new Date().getTime()
    }   
}