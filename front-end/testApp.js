var testApp = angular.module('testApp',[]);


testApp.controller('testCtrl',testCtrl);

function testCtrl($scope, $http){
    //$scope.message = "Hello from testCrol $scope.message";
    $http.get("https://bigblueaha.w3ibm.mybluemix.net/ghelabels/sheny/bigblueaha")
        .then(function(response){
            $scope.message = "response.data" + response.data;
        });
}