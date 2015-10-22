'use strict';

angular.module('telequiz')
.controller("QuizController", function ($scope, $sce, $timeout, $mdDialog, $window, $firebaseObject, $firebaseArray, $q) {
  $scope.percentage = 0;
  $scope.score = 0;
  $scope.user = {};
  $scope.quiz = {
  	begin : false,
  	activeQuestion : -1
  };
  $scope.reload = function(){
    $window.location.reload();
  };
  $scope.activeQuestionsAnswered = 0;
  $scope.clock = {};
  $scope.clock.counter = 10;
  var mytimeout = null; // the current timeoutID
  
  //instantiate firebase integration
  var firebase = new Firebase('https://telequiz.firebaseio.com/answers');
  var scores = new Firebase('https://telequiz.firebaseio.com/telequiz/leaderboard');
  
  scores.once('value', function (data) {
    $scope.users = data.val();
    console.log($scope.users.leaderboard);
  });
  $scope.answers = {};
  //fetch the answers
  firebase.once('value', function (data) {
    $scope.answers = data.val();
    console.log($scope.answers);
  });
  //quiz questions
  $scope.questions = [
  {
    "question" : "What is the most abundant mineral in intelligent people's hair?",
    "answers" : [
      {"id" : 0, "text" : "Iron"},
      {"id" : 1, "text" : "Potassium"},
      {"id" : 2, "text" : "Zinc"},
      {"id" : 3, "text" : "Kryptonite"} 
    ]
  },
  {
    "question" : "What's the largest island on earth?",
    "answers"  : [
      {"id"  : 0, "text" : "Australia"},
      {"id"  : 1, "text" : "Greenland"},
      {"id"  : 2, "text" : "New Zealand"},
      {"id"  : 3, "text" : "Madagascar"}
    ]
  },
  {
    "question" : "One year on planet Saturn is equivalent to how many years on Earth?",
    "answers"  : [
      {"id"  : 0, "text" : "12"},
      {"id"  : 1, "text" : "6"},
      {"id"  : 2, "text" : "29"},
      {"id"  : 3, "text" : "2"}
    ]
  },
  {
    "question" : "A pregnant goldfish is called a?",
    "answers"  : [
      {"id"  : 0, "text" : "foos"},
      {"id"  : 1, "text" : "twit"},
      {"id"  : 2, "text" : "floss"},
      {"id"  : 3, "text" : "gold-digger"}
    ]
  },
  {
    "question" : "What is the diameter of planet earth?",
    "answers"  : [
      {"id"  : 0, "text" : " 8000 miles"},
      {"id"  : 1, "text" : "800 miles"},
      {"id"  : 2, "text" : "80000 miles"},
      {"id"  : 3, "text" : "I slept in geography class"},
    ]
  },
  {
    "question" : "Who averaged one patent for every three weeks of his life?",
    "answers"  : [
      {"id"  : 0, "text" : "Thomas Edison"},
      {"id"  : 1, "text" : "Elon Musk"},
      {"id"  : 2, "text" : "Carl Benz"},
      {"id"  : 3, "text" : "That guy in Silicon Valley"},
    ]
  },
  {
    "question" : "what was the first planet to be discovered using the telescope in 1781?",
    "answers"  : [
      {"id"  : 0, "text" : "Mass"},
      {"id"  : 1, "text" : "Krypton"},
      {"id"  : 2, "text" : "Uranus"},
      {"id"  : 3, "text" : "Neptune"},
    ]
  },
  {
    "question" : "Who is a connoisseur?",
    "answers"  : [
      {"id"  : 0, "text" : "A douche bag"},
      {"id"  : 1, "text" : "A philanthropist"},
      {"id"  : 2, "text" : "An expert"},
      {"id"  : 3, "text" : "I slept in English class"},
    ]
  }];

  $scope.totalQuestions = $scope.questions.length;
  // begin the quiz
  $scope.begin = function () {
  	$scope.quiz.begin = true;
  	$scope.quiz.activeQuestion = 0;
  	$scope.startTimer();
  };

  // the timer method, counts down every second, stops on zero
  $scope.onTimeout = function() {
    if($scope.clock.counter ===  0) {
      $scope.$broadcast('timer-stopped', 0);
      $timeout.cancel(mytimeout);
      return;
    }
    $scope.clock.counter--;
    mytimeout = $timeout($scope.onTimeout, 1000);
  };

  $scope.startTimer = function() {
  	$scope.clock.timeover = false;
    mytimeout = $timeout($scope.onTimeout, 1000);
  };

  // stops and resets the current timer
  $scope.stopTimer = function() {
    $scope.$broadcast('timer-stopped', $scope.clock.counter);
    $scope.clock.counter = 10;
    $timeout.cancel(mytimeout);
  };

  // triggered, when the timer stops
  $scope.$on('timer-stopped', function (event, remaining) {
    if(remaining === 0) {
      $scope.clock.timeover = true;
      var curIndex = $scope.quiz.activeQuestion;
      var correctAnswer =  $scope.answers[curIndex];
      $scope.quiz.correctAnswer = $scope.questions[curIndex].answers[correctAnswer].text;
    }
  }); 

  // handle results when quiz finishes
  $scope.$watch('quiz.activeQuestion', function (activeQuestion) {
  	if (activeQuestion === $scope.totalQuestions) {
      $scope.stopTimer();
      $scope.user.percentage = $scope.percentage;
      //add scores
      $firebaseArray(scores).$add($scope.user);
  	  return ($scope.quiz.finished = true);
  	}
  });

  // when a user selects an answer
  $scope.selectAnswer = function (qIndex, aIndex) {
  	$scope.quiz.timeover = true;
    var questionState = $scope.questions[qIndex].questionState;
    if( questionState != 'answered' ) {
      $scope.questions[qIndex].selectedAnswer = aIndex;
      var correctAnswer = $scope.answers[qIndex]; 
      $scope.quiz.correctAnswer = $scope.questions[$scope.quiz.activeQuestion].answers[correctAnswer].text;
      console.log($scope.quiz.correctAnswer);
      $scope.questions[qIndex].correctAnswer = correctAnswer;
      if(aIndex === correctAnswer) {
        $scope.questions[qIndex].correctness = 'correct';
        $scope.score += 1;
        //console.log($scope.score);
      } else {
        $scope.questions[qIndex].correctness = 'incorrect';
      }
      $scope.questions[qIndex].questionState = 'answered';
    }
    $scope.percentage = (($scope.score / $scope.totalQuestions)*100).toFixed(2);
  };
  $scope.nextQuestion = function () {
  	setTimeout( function (){
  	  $scope.stopTimer();
  	  $scope.startTimer();
  	},0);
  	return $scope.quiz.activeQuestion += 1;
  };
  $scope.createShareLinks = function (percentage) {
    var url = 'https://telequiz.firebaseapp.com';

    var emailLink = '<a class="share email" href="mailto:?subject=Try to beat my quiz score!&body=I scored '+ percentage +'% on telequiz. Try to beat my score at '+ url +'"></a>';

    var twitterlLink = '<a class="share twitter" target="_blank" href="http://twitter.com/share?text=I scored '+ percentage +'% on telequiz. Try to beat my score at&url=' +url+ '&hashtags=Telequiz"></a>';

    var newMarkup = emailLink + twitterlLink;

    return $sce.trustAsHtml(newMarkup);
  };
  var auth = new Firebase("https://telequiz.firebaseio.com");
  //Authenticate the user using firebase Facebook OAuth
  function registerWithFacebook() {
    return $q(function(resolve, reject) {
      auth.authWithOAuthPopup("facebook", function(error, data) {
        if(error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }
  //get all the leaderboard data from firebase
  function getLeaderBoard (callback) {
    var reference = new Firebase("https://telequiz.firebaseio.com/leaderboard/");
    return callback($firebaseArray(reference));
  }
  //get leaderboard reference
  function data() {
    var ref = new Firebase("https://telequiz.firebaseio.com/leaderboard");
    // this uses AngularFire to create the synchronized array
    return $firebaseArray(ref);
  }
  $scope.register = function () {
    registerWithFacebook().then(function(authData){
      console.log("Heres your auth data..." + JSON.stringify(authData));
      var user = {};
      $scope.user.id = authData.facebook.id,
      $scope.user.name = authData.facebook.displayName;
      $scope.user.profileImageURL = authData.facebook.profileImageURL;
      $scope.loggedIn = true;
    });
    return $scope.user;
  };
});
