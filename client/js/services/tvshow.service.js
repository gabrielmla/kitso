var kitso = angular.module('kitso');

kitso.service('TvShowService', ['$q', '$http', function ($q, $http) {

    var tvshow = {};

    // return available functions for use in the controllers
    return ({
        loadTvShow: loadTvShow,
        getTvShow: getTvShow,
        updateTvShow: updateTvShow
    });

    function loadTvShow(id) {
        var deferred = $q.defer();

        $http.get('/api/tvShow/' + id)
            .then((response) => {
                if (response.status === 200) {
                    tvshow = response.data;
                    deferred.resolve();
                } else {
                    deferred.reject();
                }
            })
            .catch((error) => {
                deferred.reject(error.data);
            });

        return deferred.promise;
    }

    function getTvShow() {
        return tvshow;
    }

    function updateTvShow(tvShow) {
        var deferred = $q.defer();
  
        $http.put('/api/tvshow/' + tvShow._id, tvShow)
            .then(function (response) {
                if (response.status === 200) {
                    tvshow = response.data;
                    deferred.resolve(tvshow);
                } else {
                    deferred.reject();
                }
            })
            .catch(function (error) {
                deferred.reject(error.data);
            });
  
        return deferred.promise;
      }

}]);