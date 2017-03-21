var testApp = angular.module('testApp',[]);


testApp.controller('testCtrl',testCtrl);

function testCtrl($scope, $http,$log){
    //$scope.message = "Hello from testCrol $scope.message";
    $http.get("https://bigblueaha.w3ibm.mybluemix.net/login")
        .then(function(response){
            $scope.message = "response.data: " + response.data.Name;
            $log.info(response);
        }, function(reason){
            $scope.message = reason.data;
        });
}