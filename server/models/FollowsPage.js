var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FollowsPageSchema = new Schema({
    _user: {
      type: mongoose.Schema.Types.ObjectId, ref: 'User',
      required: true
    },
    following: {
      type: String,
      required: true
    },
    is_media: {
      type: Boolean,
      required: true
    }
});

var FollowsPage = mongoose.model('FollowsPage', FollowsPageSchema);

module.exports = FollowsPage;