var Game = (function($) {
	
	//current level
	var level = (sessionStorage.getItem("level") || 1);
	//var level = 1;
	//number of questionsQuantity
	var questionsQuantity = 0;
	
	//create an array to contain the answers
	var answersArry = [];
	
	var createAnswersArry = function(questionsQuantity) {
	    answersArry = new Array(questionsQuantity + 1);
	};
	
	//game reset
	var gameReset = function() {
		$(".page-wrap").load("index.html #content-wrap", function() {
			Game.init();
		});
	};
	
	var setTrophies = function(level) {
		if(level == 1) {
			$(".trophy").hide();
		}else{
			for(var i=level; i > 1; i--) {
			    $(".trophy#t" + (i - 1)).show();
		    }
		}
	};
	
	var tryagain = function(state) {
		if(state == "on") {
			$("#tryagain").show();
		}else {
			$("#tryagain").hide();
		}
	};
	
	var gonextlevelbtn = function(state) {
		if(state == "on") {
			$("#gonextlevel").show();
		}else {
			$("#gonextlevel").hide();
		}
	};
	
	var setLevel = function(thisLevel) {
		level = thisLevel;
		sessionStorage.setItem('level', thisLevel);
		$(".game-level").empty().text("Level " + level);
		//set trophies
		setTrophies(level);
		//reset submit button
		$("#submit").removeClass("disabled");
		$("#submit").click(answerSubmitHandler);
	}
	
	var goToNextLevel = function() {
		level = parseInt(level);
		level++;
		loadQuestions(level);
	};
	
	var shuffle = function (a) {
		var j, x, i;
		for (i = a.length; i; i--) {
			j = Math.floor(Math.random() * i);
			x = a[i - 1];
			a[i - 1] = a[j];
			a[j] = x;
		}
	};
	
    //card drop handler
	var handleCardDrop = function(event, ui) {
		//ui behavior
		ui.draggable.position({of: $(this), my: 'left top', at: 'left top'});
		ui.draggable.addClass('answer-card-dropped');
           ui.draggable.draggable('option', 'revert', false);
		//get card and target ids
		var answerCardId = ui.draggable.attr("id").replace("ac-","");
		answerCardId = parseInt(answerCardId);
		var answerTargetId = $(event.target).parent().attr("id").replace("q","");
		//store answer in answers array
		answersArry.splice(answerTargetId,1,answerCardId);
		//alert("answerd card id: " + answerCardId + " answer target id " + answerTargetId);
	};
		
	//card remove answer handler
	var handleCardOut = function(event, ui) {
	    ui.draggable.removeClass('answer-card-dropped');
	};
	
	//grade answers and display correct or incorrect
	var answerSubmitHandler = function() {
		$(".correct, .incorrect").remove();
		$("#submit").unbind("click");
		var correctAnswers = 0;
		for(i=1; i < answersArry.length; i++) {
			if ((i) == answersArry[i]) {
				$("<span class='correct'></span'>").hide().appendTo("#q" + (i)).fadeIn("slow");
				correctAnswers++;
			} else {	
                   $("<span class='incorrect'></span'>").hide().appendTo("#q" + (i)).fadeIn("slow");			
			}
		}
		$("#submit").addClass("disabled");
		
		var grade = (correctAnswers / questionsQuantity) * 100;
		
		//display grade results
		if (grade >= 75) {
			
			swal({
				title: "Good job!", 
				text: "You answered " + correctAnswers + "/" + questionsQuantity + " questions correctly! \n \n Your grade: " + grade + "%",
				type: "success",
				showCancelButton: true
			},
			function(isConfirm) {
				if(isConfirm) {
					goToNextLevel();
				}else{
					gonextlevelbtn("on");
				}
				
			});
		}else {
			//display grade results
			swal({
				title: "Uh oh...try again?", 
				text: "You only answered " + correctAnswers + "/" + questionsQuantity + " questions correctly. \n \n You must score 70% or higher to pass. \n \n Your grade: " + grade + "%",
				type: "error",
				showCancelButton: true
			},
			function(isConfirm) {
				if(isConfirm){
					gameReset();
				}else{
					tryagain("on");
				}
			});
		}
		
	};

	var setUp = function() {
		
		//make answer cards draggable
		$(function() {
		    $(".answer-card").draggable({
				revert: true
			});
		});
		
		//setup droppable target areas
		$(".answer-target").droppable({
			drop: handleCardDrop,
			out: handleCardOut
        });
		
		questionsQuantity = $(".question").length;
	    createAnswersArry(questionsQuantity);
		
		setLevel(level);
		
	};
	
	var loadQuestions = function(level) {
		$("#questions, #answer-bank").empty();
		$(".questions").addClass("level-" + level);
		var ansArry = [];
		$.getJSON("js/phrasal-verbs-quiz.json", function(data) {
			var levelExists = false;
			$.each(data, function(key, val) {
				if(level == key.replace("level-", "")) {
					levelExists = true;
					$.each(val.questions, function(key, val) {
						$.each(val, function(key, val) {
							//output questions to UI
							var thisQuestion = $("<div>", { class: "question", id: key });
							var qNumber = key.replace("q", "");
							val = qNumber + " " + val.replace("*", "<div class='answer-target'></div>");
							thisQuestion.html(val);
							$("#questions").append(thisQuestion);
						});
					});
					$.each(val.answers, function(key, val) {
						$.each(val, function(key, val) {
							//output answers to UI
							var thisAnswer = $("<div>", { class: "answer-card", id: key });
							thisAnswer.html(val);
							ansArry.push(thisAnswer);
						});
					});
					
				}
			});
			//either set trophies for next screen or go to certificate page if no levels remaining
			if (levelExists == false) {
				window.location = "certificate.html";
			}else {
				setTrophies(level);
				gonextlevelbtn("off");
			}
		}).done(function() {
			//output answer cards in random order
			shuffle(ansArry);
			$.each(ansArry, function(key, val) {
				$("#answer-bank").append(val);
				//alert(val);
			});
			setUp();
		});
	};
		
	var init = function() {
			
		//hide trophies
		$(".trophy").hide();
			
		//set reset button behavior
		$(".reset a").click(function(e) {
			e.preventDefault();
			swal({
				title: "Reset quiz", 
				text: "Are you sure you want to start over?",
				type: "warning",
				showCancelButton: true
			},
			function(isConfirm) {
				if(isConfirm) {
					level = 1;
					loadQuestions(level);
					$(".trophy").hide();
				}
			});
				
		});
			
		$("#tryagain").click(function(e){
			e.preventDefault();
			gameReset();
		});
			
		$("#gonextlevel").click(function(e) {
			e.preventDefault();
			goToNextLevel();
		});
			
		//set submit button behavior
		$("#submit").click(answerSubmitHandler);
			
		loadQuestions(level);
	};
		
	return {
		init: init
	}
		
})(jQuery);	
	
jQuery(document).ready(function() {
	
	Game.init();
	
});