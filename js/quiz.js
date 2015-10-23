'use strict';

angular.module('telequiz')
.controller("QuizController", function ($scope, $sce, $timeout, $mdDialog, $window, $firebaseObject, $firebaseArray, $q) {
  $scope.percentage = 0;
  $scope.score = 0;
  $scope.user = {};
  $scope.user.loggedIn = false;
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
  
  //get all the leaderboard data from firebase
  var getLeaderBoard = function (callback) {
    var reference = new Firebase("https://telequiz.firebaseio.com/leaderboard/");
    // Retrieve new posts as they are added to our database
    var data = $firebaseArray(reference);
    return callback(data);
  };

  //Authenticate the user using firebase Facebook OAuth
  var auth = new Firebase("https://telequiz.firebaseio.com");
  
  //register with facebook to save your scores
  var  registerWithFacebook = function () {
    return $q(function(resolve, reject) {
      auth.authWithOAuthPopup("facebook", function(error, data) {
        if(error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  };

  //get leaderboard reference to add new data
  var addData = function () {
    var ref = new Firebase("https://telequiz.firebaseio.com/leaderboard");
    // this uses AngularFire to create the synchronized array
    return $firebaseArray(ref);
  };

  //register a user using facebook
  $scope.register = function () {
    registerWithFacebook().then(function(authData){
      $scope.user.id = authData.facebook.id,
      $scope.user.name = authData.facebook.displayName;
      $scope.user.profileImageURL = authData.facebook.profileImageURL;
      $scope.user.loggedIn = true;
    });
    return $scope.user;
  };

  
  //call the leader board and return data
  getLeaderBoard ( function (leaderBoardData) {
    $scope.leaderBoard = leaderBoardData; 
    console.log("USERS", leaderBoardData);
  });

  $scope.answers = {};
  //fetch the answers
  firebase.once('value', function (data) {
    $scope.answers = data.val();
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

  $scope.startTimer = function () {
  	$scope.clock.timeover = false;
    mytimeout = $timeout($scope.onTimeout, 1000);
  };

  // stops and resets the current timer
  $scope.stopTimer = function () {
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

      //compute 
    }
  }); 

  // handle results when quiz finishes
  $scope.$watch('quiz.activeQuestion', function (activeQuestion) {
  	if (activeQuestion === $scope.totalQuestions) {
      $scope.stopTimer();
      $scope.user.percentage = $scope.percentage;

      if ($scope.user.id !== undefined) {
        var exists = false;
        for (var i = 0; i < $scope.leaderBoard.length; i++) {
          if ($scope.leaderBoard[i].id == $scope.user.id) {
            console.log("Already existing in board...");
            $scope.leaderBoard[i].percentage = $scope.percentage;
            var list = addData();
            list[i] = $scope.leaderBoard[i];
            list.$save(i);
            exists = true;
            break;
          }
        }
        if (!exists) {
          console.log("User does not exist");
          addData().$add($scope.user);
        }
        console.log("made changes...");
      }
      return ($scope.quiz.finished = true);
  	}
  });

  // when a user selects an answer
  $scope.selectAnswer = function (qIndex, aIndex) {
  	$scope.quiz.timeover = true;
    var questionState = $scope.questions[qIndex].questionState;
    if ($scope.clock.timeover === true) {
      //disable radio button by just doing nothing when clicked
      return angular.noop();
    }
    if (questionState != 'answered') {
      $scope.questions[qIndex].selectedAnswer = aIndex;
      var correctAnswer = $scope.answers[qIndex]; 
      $scope.quiz.correctAnswer = $scope.questions[$scope.quiz.activeQuestion].answers[correctAnswer].text;
      $scope.questions[qIndex].correctAnswer = correctAnswer;
      if (aIndex === correctAnswer) {
        $scope.questions[qIndex].correctness = 'correct';
        $scope.score += 1;
      } else {
        $scope.questions[qIndex].correctness = 'incorrect';
      }
      $scope.questions[qIndex].questionState = 'answered';
    }
    $scope.percentage = ( ($scope.score / $scope.totalQuestions) * 100 ).toFixed(2);
  };

  // handle next question button
  $scope.nextQuestion = function () {
  	setTimeout( function (){
  	  $scope.stopTimer();
  	  $scope.startTimer();
  	},0);
  	return $scope.quiz.activeQuestion += 1;
  };
});
