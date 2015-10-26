/**
 * Author <Jee Githinji Gikera {githinjigikera@gmail.com}>
 * 
 * telequiz controller
 * 
 */
'use strict';

angular.module('telequiz')
.controller('QuizController', function ($scope, $sce, $timeout, $mdDialog, $window, $firebaseObject, $firebaseArray, $q) {
  $scope.percentage = 0;
  $scope.score = 0;
  $scope.user = {};
  $scope.user.loggedIn = false;
  $scope.quiz = {
  	begin : false,
  	questionIndex : -1
  };
  $scope.reload = function(){
    $window.location.reload();
  };
  $scope.clock = {};
  $scope.clock.counter = 4;
  var mytimeout = null; // the current timeoutID
  var alert;
  
  //instantiate firebase integration and firebase Facebook OAuth
  var firebase = new Firebase('https://telequiz.firebaseio.com/answers'),
      auth = new Firebase('https://telequiz.firebaseio.com'),
      users = new Firebase('https://telequiz.firebaseio.com/leaderboard');
  //get all the leaderboard data from firebase
  var getLeaderBoard = function (callback) {
    // Retrieve new posts as they are added to our database
    var data = $firebaseArray(users);
    return callback(data);
  };

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
    //angularfire array sync
    return $firebaseArray(users);
  };

  //register a user using facebook
  $scope.register = function () {
    registerWithFacebook().then(function(authData){
      $scope.user.id = authData.facebook.id;
      $scope.user.name = authData.facebook.displayName;
      $scope.user.profileImageURL = authData.facebook.profileImageURL;
      $scope.user.loggedIn = true;
    });
    return $scope.user;
  };

  //call the leader board and return data
  getLeaderBoard ( function (leaderBoardData) {
    $scope.leaderBoard = leaderBoardData; 
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
      {"id"  : 1, "text" : "8000 km"},
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
      {"id"  : 0, "text" : "Mars"},
      {"id"  : 1, "text" : "Krypton"},
      {"id"  : 2, "text" : "Uranus"},
      {"id"  : 3, "text" : "Neptune"},
    ]
  },
  {
    "question" : "Which animal is known to kill more people than plane crashes?",
    "answers"  : [
      {"id"  : 0, "text" : "A donkey"},
      {"id"  : 1, "text" : "A rat"},
      {"id"  : 2, "text" : "A crock"},
      {"id"  : 3, "text" : "A poison toad"},
    ]
  },
  {
    "question" : "What is a group of frogs known as?",
    "answers"  : [
      {"id"  : 0, "text" : "An army"},
      {"id"  : 1, "text" : "A forte"},
      {"id"  : 2, "text" : "A pack"},
      {"id"  : 3, "text" : "Many princes"},
    ]
  },
  {
    "question" : "What's so special about a violin?",
    "answers"  : [
      {"id"  : 0, "text" : "It has 24 different plugs"},
      {"id"  : 1, "text" : "It's the only string instrument with 4 strings"},
      {"id"  : 2, "text" : "It's made of 70 different pieces of wood"},
      {"id"  : 3, "text" : "Deez nuts"},
    ]
  },
  {
    "question" : "How old is the world's oldest piece of chewing gum?",
    "answers"  : [
      {"id"  : 0, "text" : "90 years old"},
      {"id"  : 1, "text" : "900 years old"},
      {"id"  : 2, "text" : "9000 years old"}, //
      {"id"  : 3, "text" : "Are you kidding me?"},
    ]
  },
  {
    "question" : "What do the British call the vegetable that Americans call Zucchini?",
    "answers"  : [
      {"id"  : 0, "text" : "A aubergine "},
      {"id"  : 1, "text" : "A cauli"},
      {"id"  : 2, "text" : "A courgette"}, //
      {"id"  : 3, "text" : "English is english"},
    ]
  },
  {
    "question" : "How long is a kangaroo baby, when it's born?",
    "answers"  : [
      {"id"  : 0, "text" : "1 mm"},
      {"id"  : 1, "text" : "1 centimeter"},
      {"id"  : 2, "text" : "1 inch"},//
      {"id"  : 3, "text" : "1 little thing"},
    ]
  },
  ];

  $scope.totalQuestions = $scope.questions.length;
  // begin the quiz
  $scope.begin = function () {
  	$scope.quiz.begin = true;
  	$scope.quiz.questionIndex = 0;
  	$scope.quiz.randomQuestion = randomQuestion();
    $scope.startTimer();
  };
  var randomArray = [0,1,2,3,4,5,6,7,8,9,10,11,12];
  var randomQuestion = function () {
    var index = Math.floor(Math.random() * (randomArray.length));
    var value = randomArray.splice(index, 1);
    console.log("Random value chosen ",value[0]);
    console.log("Remaining array ", randomArray);
    return value[0];
  };

  // the timer method, counts down every second, stops on zero
  $scope.onTimeout = function() {
    if($scope.clock.counter ===  1) {
      $scope.$broadcast('timer-stopped', 1);
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
    $scope.clock.counter = 4;
    $timeout.cancel(mytimeout);
  };

  // when time stops, get correct answer
  $scope.$on('timer-stopped', function (event, remaining) {
    if(remaining === 1) {
      $scope.clock.timeover = true;
      var curIndex = $scope.quiz.questionIndex;
      var correctAnswer =  $scope.answers[curIndex];
      $scope.quiz.correctAnswer = $scope.questions[curIndex].answers[correctAnswer].text;
    }
  }); 

  // handle results when quiz finishes
  $scope.$watch('quiz.questionIndex', function (activeQuestion) {
    // the quiz is done
  	if (activeQuestion === $scope.totalQuestions) {
      $scope.stopTimer();
      $scope.user.percentage = $scope.percentage;
      if ($scope.user.id !== undefined) {
        var exists = false;
        for (var i = 0; i < $scope.leaderBoard.length; i++) {
          if ($scope.leaderBoard[i].id == $scope.user.id) {
            $scope.leaderBoard[i].percentage = $scope.percentage;
            var list = addData();
            list[i] = $scope.leaderBoard[i];
            list.$save(i);
            exists = true;
            break;
          }
        }
        if (!exists) {
          $scope.user.percentage = $scope.percentage;
          addData().$add($scope.user);
        }
      } else {
        //prompt user to log in to save scores
        showAlert();
        $scope.$watch('user.loggedIn',function (isLoggedIn) {
          if (isLoggedIn === true) {
            for (var i = 0; i < $scope.leaderBoard.length; i++) {
              if ($scope.leaderBoard[i].id == $scope.user.id) {
                $scope.leaderBoard[i].percentage = $scope.percentage;
                var list = addData();
                list[i] = $scope.leaderBoard[i];
                list.$save(i);
                exists = true;
                break;
              }
            }
            if (!exists) {
              $scope.user.percentage = $scope.percentage;
              addData().$add($scope.user);
            }
          }
        });
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
      $scope.quiz.correctAnswer = $scope.questions[$scope.quiz.questionIndex].answers[correctAnswer].text;
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
    
    $scope.quiz.randomQuestion = randomQuestion();
  	// increment question counter
    return $scope.quiz.questionIndex += 1;
  };

  //Result dialog. Loaded from  the resultDialog.html template
  function showDialog(ev) {
    $mdDialog.show ({
      controller : DialogController,
      templateUrl: 'dialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutSideToClose: true,
    });
  }

  function showAlert() {
    alert = $mdDialog.alert()
      .title('Attention')
      .content('Please click the icon on the right to save your scores')
      .ok('Close');

    $mdDialog.show(alert).finally( function(){
      alert = undefined;
    });
  }

  function closeAlert() {
    $mdDialog.hide(alert, 'finished');
    alert = undefined;
  }
})
// control the dialog
.controller('DialogController', function ($scope, $mdDialog) {
  $scope.hide = function () {
    $mdDialog.hide();
  };
  $scope.cancel = function () {
    $mdDialog.cancel();
  };
});


