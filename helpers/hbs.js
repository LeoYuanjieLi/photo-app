module.exports = {
    isclient: function (user) {
        return user.userType === "client";
    },

    isCreator: function(userID, job) {

        return userID === job;
    }
}