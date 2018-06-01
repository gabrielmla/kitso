 var kitso = angular.module('kitso');

kitso.controller('ProfileController', ['$scope', '$location', '$timeout', '$routeParams', 'AuthService', 'UserService', 'FollowService', 'WatchedService', 'RatedService',
function ($scope, $location, $timeout, $routeParams, AuthService, UserService, FollowService, WatchedService, RatedService) {

  $('.full-loading').show();
  AuthService.getStatus()
    .then(() => {
      $scope.user = AuthService.getUser();
      if ($routeParams.user_id){
        $scope.logged_user = $scope.user;
        UserService.getUser($routeParams.user_id).then((user)=> {
          $scope.user = user;
          loadUserRatedInfo();
          loadUserFollowInfo();
          loadUserWatchedInfo();
          $('.full-loading').hide();
          FollowService.isFollowingUser($scope.logged_user._id, $scope.user._id).then((followed) => {
            $scope.user.followed = followed;
          }).catch((error) => {
            console.log(error)
            UIkit.notification({
                message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
                status: 'danger',
                timeout: 2500
            });
          })
        }).catch((error)=>{
          $location.path('/profile');
        })
      }
      else{
        $scope.logged_user = $scope.user;
        loadUserRatedInfo();
        loadUserFollowInfo();
        loadUserWatchedInfo();
        $('.full-loading').hide();
      }
    });

  $scope.formatDate = function (date) {
    return moment(date).format('DD/MM/YYYY')
  };
  var compareDates = function(a,b){
    return - moment(a.date).diff(moment(b.date))
  }

  var loadUserWatchedInfo = function(){
    WatchedService.getAllWatched($scope.user._id)
      .then(function (watched) {
        watched.forEach(function (watched) {
          watched.date = new Date(watched.date);
        });
        watched = watched.sort(compareDates);

        $scope.user.watched = watched
      }).catch(function (error) {
        console.log(error);
      });
  }

  var loadUserRatedInfo = function(){
    RatedService.getAllRated($scope.user._id)
      .then((ratings) => {
        ratings.forEach((rated) => {
          rated.date = new Date(rated.date);
        });

        $scope.user.ratings = ratings;
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  var loadUserFollowInfo = function(){
    FollowService.getUsersFollowing($scope.user._id).then( function(following){
        $scope.user.following = following
      }).catch(function(error){
          console.log(error);
      })

    FollowService.getPagesFollowing($scope.user._id).then( function(following_pages){
        $scope.user.following_pages = following_pages
      }).catch(function(error){
          console.log(error);
      })

    FollowService.getUsersFollowers($scope.user._id).then( function(followers){
        $scope.user.followers = followers;
      }).catch(function(error){
          console.log(error);
      })
  }

  $scope.unfollow_user = function(unfollowedUser){
    FollowService.isFollowingUser($scope.user._id, unfollowedUser._id).then( function(following){
      if (following.is_following) {
        FollowService.unfollowUser(following.following_id);
        $scope.user.following.splice($scope.user.following.indexOf(unfollowedUser),1);
        }
    })
  }

  $scope.unfollow_page = function(unfollowedPage){
    FollowService.isFollowingPage($scope.user._id, unfollowedPage._id).then( function(following){
      if (following.is_following) {
        FollowService.unfollowPage(following.following_id);
        $scope.user.following_pages.splice($scope.user.following_pages.indexOf(unfollowedPage),1);
        }
    })
  }

  $scope.goToPage = function (followble_obj) {
    if (followble_obj.hasOwnProperty('__t')) {
      if (followble_obj.__t === 'TvShow') {
        $location.path('tvshow/' + followble_obj._id);
      } else if (followble_obj.__t === "Movie") {
        $location.path('movie/' + followble_obj._id);
      }
    } else {
      $location.path('person/' + followble_obj._id);
    }
  }

  $scope.goToMedia = function (media) {
    if (media.__t === 'TvShow') {
      $location.path('tvshow/' + media._id);
    } else if (media.__t === "Movie") {
      $location.path('movie/' + media._id);
    } else if (media.__t === "Episode"){
      $location.path('tvshow/' + media._tvshow_id + '/season/'+ media.season_number);
    }

  }

  $scope.getPoster = function(media){
    console.log(media)
    if (media.poster_path){
      return poster_path;
    }
    if(media.images && media.images.poster){
      return media.images.poster;
    }
    if(media.helper && media.helper.poster_path){
      return 'https://image.tmdb.org/t/p/w500/' + media.helper.poster_path;
    }
  }

  $scope.range = function(count){
      var ratings = [];
      for (var i = 0; i < count; i++) {
          ratings.push(i+1)
      }
      return ratings;
  }


  $scope.updateWatched = function (watched) {
    WatchedService.updateWatched(watched).then(function (watched) {
      UIkit.dropdown($('#watched-date-' + watched._id)).hide()
    }).catch(function (error) {
      console.log(error);
    })

  }

  $scope.follow = function(user){
    userId = user._id;
      FollowService.followUser($scope.logged_user._id, userId)
      .then((followed) => {
          user.followed = followed;
          user.followed.following_id = followed._id;
          user.followed.is_following = true;
      })
      .catch((error) => {
          UIkit.notification({
              message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
              status: 'danger',
              timeout: 2500
          });
      });
  };

  $scope.unfollow = function(user){
    var followId = user.followed.following_id;
      FollowService.unfollowUser(followId)
      .then((followed) => {
          user.followed = false;
      })
      .catch((error) => {
          UIkit.notification({
              message: '<span uk-icon=\'icon: check\'></span> ' + error.errmsg,
              status: 'danger',
              timeout: 2500
          });
      });
  }

  $scope.canEdit = function(user){
    if (!$scope.user || !$scope.logged_user)
      return false;
    else
      return ($scope.user._id === $scope.logged_user._id);
  }
  $scope.updateRated = function (rated, n) {
    rated.rating = n;
    RatedService.updateRated(rated)
      .then((rated) => {
        UIkit.dropdown($('#rated-' + rated._id)).hide();
      }).catch((error) => {
        console.log(error);
      });

  }

  $scope.submitForm = function () {

    if ($scope.editForm.$valid) {
      UserService.editUser($scope.user)
        // handle success
        .then(function () {
          $scope.descriptionArea = false;
          UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> User successfully edited.',
            status: 'success',
            timeout: 1500
          });
        })
        // handle error
        .catch(function (error) {
          var dangerMessage = 'Something went wrong...';

          if (error.hasOwnProperty('code') && error.code === 11000) {
            if (error.errmsg.includes('username_1')) {
              dangerMessage = 'Username already in use';
            } else if (error.errmsg.includes('email_1')) {
              dangerMessage = 'Email already in use';
            }

            UIkit.notification({
              message: '<span uk-icon=\'icon: check\'></span> ' + dangerMessage,
              status: 'danger',
              timeout: 2500
            });
          } else {
            UIkit.notification({
              message: '<span uk-icon=\'icon: check\'></span> ' + dangerMessage,
              status: 'danger',
              timeout: 2500
            });
          }
        });
    }
  };

  $scope.deleteAccount = function () {
    if ($scope.deleteForm.$valid && $scope.confirmationText($scope.delete.text)) {
      AuthService.deleteUser($scope.user._id, $scope.delete.password)
        .then(() => {
          UIkit.notification({
            message: '<span uk-icon=\'icon: check\'></span> Account deleted. Good Bye :(',
            status: 'success',
            timeout: 2500
          });

          $timeout(function () {
            UIkit.modal('#modal-delete2').hide();
            $location.path('/login');
          }, 1500);
        })
        .catch((error) => {
          if (error.status == 401) {
            UIkit.notification({
              message: "<span uk-icon=\'icon: check\'></span> Wrong password.",
              status: 'danger',
              timeout: 2000
            });
          } else {
            UIkit.notification({
              message: "<span uk-icon=\'icon: check\'></span> We can't delete your account right now. Please contact the support.",
              status: 'warning',
              timeout: 2500
            });
          }
        });
    } else {
      UIkit.notification({
        message: "<span uk-icon=\'icon: check\'></span> Please input both the password and the exact confirmation text.",
        status: 'warning',
        timeout: 2500
      });
    }
  };

  $scope.isInvalid = function (field) {
    return (field.$invalid && !field.$pristine);
  };

  $scope.confirmationText = function (text) {
    return text === 'I know this is a permanent action';
  }

  //$scope.descriptionArea = false;
  $scope.toggleDescriptionArea = function () {
    $scope.descriptionArea = !$scope.descriptionArea;
  }

}]);
