
module.exports = {
    isclient: function (user) {
        return user.userType === "client";
    },

    isCreator: function(userID, job) {

        return userID === job;
    },

    isTaker: function(userID, jobTaker) {
        // check if the current logged in userID is the same as the jobTaker
        if(userID === jobTaker && userID != undefined && jobTaker != undefined) {
            return true;
        }
    },

}