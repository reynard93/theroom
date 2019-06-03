  const generateMessage = ( audiof,text,username) => {
    return {
      audiof,
      username: [username? username:"Tommy Wisseau"],
      text,
      createdAt: new Date().getTime()
    }
  }

  const generateLocationMessage = (username, url) => {
    return {
      username,
      url,
      createdAt: new Date().getTime()
    }
  }

  module.exports = {
   generateMessage,
   generateLocationMessage 
  }